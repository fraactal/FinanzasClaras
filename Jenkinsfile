pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  parameters {
    string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region for the demo environment')
    string(name: 'INSTANCE_TYPE', defaultValue: 't3.small', description: 'EC2 instance type')
    string(name: 'SSH_INGRESS_CIDR', defaultValue: '0.0.0.0/0', description: 'CIDR block allowed to reach SSH on the demo VM')
    booleanParam(name: 'APPLY_INFRA', defaultValue: true, description: 'Run Terraform apply before deploying the app')
  }

  environment {
    TF_IN_AUTOMATION = 'true'
    TF_INPUT = '0'
    TF_DIR = 'infra/terraform'
    DEPLOY_DIR = '/opt/finanzas-claras'
    REMOTE_USER = 'ubuntu'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate') {
      steps {
        powershell '''
        python -m compileall backend/app
        '''
      }
    }

    stage('Terraform Apply') {
      when {
        expression { return params.APPLY_INFRA }
      }
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'demo-vm-public-key', variable: 'DEMO_VM_PUBLIC_KEY')
        ]) {
          powershell '''
          $ErrorActionPreference = "Stop"
          $tfVars = @{
            aws_region        = "${params.AWS_REGION}"
            instance_type     = "${params.INSTANCE_TYPE}"
            ssh_ingress_cidrs = @("${params.SSH_INGRESS_CIDR}")
            public_key        = $env:DEMO_VM_PUBLIC_KEY
          } | ConvertTo-Json -Depth 3
          Set-Content -Path "$env:TF_DIR/jenkins.auto.tfvars.json" -Value $tfVars
          terraform -chdir=$env:TF_DIR init
          terraform -chdir=$env:TF_DIR apply -auto-approve
          '''
        }
      }
    }

    stage('Deploy Demo') {
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          sshUserPrivateKey(credentialsId: 'demo-vm-ssh-key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USERNAME'),
          file(credentialsId: 'finanzas-claras-demo-env', variable: 'PROD_ENV_FILE'),
          string(credentialsId: 'admin-demo-name', variable: 'ADMIN_DEMO_NAME'),
          string(credentialsId: 'admin-demo-email', variable: 'ADMIN_DEMO_EMAIL'),
          string(credentialsId: 'admin-demo-password', variable: 'ADMIN_DEMO_PASSWORD')
        ]) {
          powershell '''
          $ErrorActionPreference = "Stop"
          $publicIp = terraform -chdir=$env:TF_DIR output -raw public_ip
          $remoteUser = if ($env:SSH_USERNAME) { $env:SSH_USERNAME } else { $env:REMOTE_USER }
          $remote = "$remoteUser@$publicIp"

          ssh -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE $remote "mkdir -p $env:DEPLOY_DIR && rm -rf $env:DEPLOY_DIR/backend $env:DEPLOY_DIR/frontend"

          scp -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE docker-compose.prod.yml ${remote}:$env:DEPLOY_DIR/docker-compose.prod.yml
          scp -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE $env:PROD_ENV_FILE ${remote}:$env:DEPLOY_DIR/.env
          scp -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE -r backend ${remote}:$env:DEPLOY_DIR/
          scp -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE -r frontend ${remote}:$env:DEPLOY_DIR/

          ssh -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE $remote "cd $env:DEPLOY_DIR && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
          ssh -o StrictHostKeyChecking=no -i $env:SSH_KEY_FILE $remote "cd $env:DEPLOY_DIR && docker compose -f docker-compose.prod.yml exec -T backend python -m app.scripts.seed_admin --name '$env:ADMIN_DEMO_NAME' --email '$env:ADMIN_DEMO_EMAIL' --password '$env:ADMIN_DEMO_PASSWORD'"
          '''
        }
      }
    }
  }

  post {
    success {
      powershell '''
      $publicIp = terraform -chdir=$env:TF_DIR output -raw public_ip
      Write-Host "Demo deployed at http://$publicIp"
      '''
    }
  }
}
