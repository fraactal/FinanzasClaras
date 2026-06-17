pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    TF_IN_AUTOMATION = 'true'
    TF_INPUT = '0'
    TF_DIR = 'infra/terraform'
    APP_NAME = 'finanzasclaras'
    DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : env.BRANCH_NAME == 'staging' ? 'staging' : 'demo'}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate App') {
      steps {
        sh '''
          set -eu
          test -f AGENTS.md
          test -f Jenkinsfile
          test -f docker-compose.prod.yml
          test -f backend/app/scripts/seed_admin.py
          test -f infra/terraform/backend/demo.hcl.example
          test -f infra/terraform/backend/staging.hcl.example
          test -f infra/terraform/backend/production.hcl.example
          test -f infra/terraform/environments/demo.tfvars.example
          test -f infra/terraform/environments/staging.tfvars.example
          test -f infra/terraform/environments/production.tfvars.example
        '''
      }
    }

    stage('Terraform Format') {
      steps {
        dir(env.TF_DIR) {
          sh 'terraform fmt -check -recursive'
        }
      }
    }

    stage('Terraform Init') {
      steps {
        script {
          withCredentials([
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-access-key-id", variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-secret-access-key", variable: 'AWS_SECRET_ACCESS_KEY'),
            file(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-tf-backend", variable: 'TF_BACKEND_FILE')
          ]) {
            dir(env.TF_DIR) {
              sh 'terraform init -backend-config="$TF_BACKEND_FILE"'
            }
          }
        }
      }
    }

    stage('Terraform Validate') {
      steps {
        script {
          withCredentials([
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-access-key-id", variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-secret-access-key", variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-vm-public-key", variable: 'VM_PUBLIC_KEY')
          ]) {
            dir(env.TF_DIR) {
              sh '''
                cat > jenkins.auto.tfvars.json <<EOF
                {
                  "public_key": "${VM_PUBLIC_KEY}"
                }
                EOF
                terraform validate
              '''
            }
          }
        }
      }
    }

    stage('Terraform Plan') {
      steps {
        script {
          withCredentials([
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-access-key-id", variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-secret-access-key", variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-vm-public-key", variable: 'VM_PUBLIC_KEY')
          ]) {
            dir(env.TF_DIR) {
              sh '''
                cat > jenkins.auto.tfvars.json <<EOF
                {
                  "public_key": "${VM_PUBLIC_KEY}"
                }
                EOF
                terraform plan -var-file="environments/${DEPLOY_ENV}.tfvars.example"
              '''
            }
          }
        }
      }
    }

    stage('Production Approval') {
      when {
        branch 'main'
      }
      steps {
        input message: 'Approve production apply and deploy for FinanzasClaras?', ok: 'Deploy production'
      }
    }

    stage('Terraform Apply') {
      when {
        anyOf {
          branch 'main'
          branch 'staging'
          branch 'develop'
        }
      }
      steps {
        script {
          withCredentials([
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-access-key-id", variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-secret-access-key", variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-vm-public-key", variable: 'VM_PUBLIC_KEY')
          ]) {
            dir(env.TF_DIR) {
              sh '''
                cat > jenkins.auto.tfvars.json <<EOF
                {
                  "public_key": "${VM_PUBLIC_KEY}"
                }
                EOF
                terraform apply -auto-approve -var-file="environments/${DEPLOY_ENV}.tfvars.example"
              '''
            }
          }
        }
      }
    }

    stage('Deploy') {
      when {
        anyOf {
          branch 'main'
          branch 'staging'
          branch 'develop'
        }
      }
      steps {
        script {
          withCredentials([
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-access-key-id", variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-aws-secret-access-key", variable: 'AWS_SECRET_ACCESS_KEY'),
            sshUserPrivateKey(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-vm-ssh", keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USERNAME'),
            file(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-env-file", variable: 'PROD_ENV_FILE'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-admin-name", variable: 'ADMIN_NAME'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-admin-email", variable: 'ADMIN_EMAIL'),
            string(credentialsId: "finanzasclaras-${env.DEPLOY_ENV}-admin-password", variable: 'ADMIN_PASSWORD')
          ]) {
            dir(env.TF_DIR) {
              sh '''
                public_ip="$(terraform output -raw public_ip)"
                app_directory="$(terraform output -raw app_directory)"
                remote="${SSH_USERNAME}@${public_ip}"

                ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$remote" \
                  "mkdir -p '$app_directory' && rm -rf '$app_directory/backend' '$app_directory/frontend'"

                scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$WORKSPACE/docker-compose.prod.yml" "$remote:$app_directory/docker-compose.prod.yml"
                scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$PROD_ENV_FILE" "$remote:$app_directory/.env"
                scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r "$WORKSPACE/backend" "$remote:$app_directory/"
                scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r "$WORKSPACE/frontend" "$remote:$app_directory/"

                ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$remote" \
                  "cd '$app_directory' && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"

                ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$remote" \
                  "cd '$app_directory' && docker compose -f docker-compose.prod.yml exec -T \
                  -e SEED_ADMIN_NAME='$ADMIN_NAME' \
                  -e SEED_ADMIN_EMAIL='$ADMIN_EMAIL' \
                  -e SEED_ADMIN_PASSWORD='$ADMIN_PASSWORD' \
                  backend sh -lc 'python -m app.scripts.seed_admin --name \"$SEED_ADMIN_NAME\" --email \"$SEED_ADMIN_EMAIL\" --password \"$SEED_ADMIN_PASSWORD\"'"
              '''
            }
          }
        }
      }
    }
  }

  post {
    always {
      echo "Pipeline finished for ${env.JOB_NAME} on ${env.DEPLOY_ENV}"
    }
  }
}
