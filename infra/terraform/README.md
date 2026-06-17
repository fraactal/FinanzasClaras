# Terraform de FinanzasClaras

Este directorio contiene la infraestructura propia de `FinanzasClaras`.

## Principios

- Este Terraform pertenece a este repositorio, no al Jenkins central.
- El estado debe quedar aislado por proyecto y ambiente.
- Jenkins centralizado solo ejecuta este Terraform; no lo reemplaza.
- Los backends y variables de ejemplo se separan por ambiente.

## Estructura

```text
infra/terraform/
  backend/
    demo.hcl.example
    staging.hcl.example
    production.hcl.example
  environments/
    demo.tfvars.example
    staging.tfvars.example
    production.tfvars.example
  main.tf
  outputs.tf
  user_data.sh.tftpl
  variables.tf
  versions.tf
```

## Mapeo de ramas

- `develop` -> `demo`
- `staging` -> `staging`
- `main` -> `production`

## Integración con Jenkins centralizado

El `Jenkinsfile` de este repo:

1. selecciona el ambiente según la rama
2. ejecuta `terraform init` con backend inyectado desde Jenkins
3. ejecuta `terraform validate`
4. ejecuta `terraform plan`
5. ejecuta `terraform apply`
6. usa `public_ip` y `app_directory` para desplegar la app por SSH

## Estado remoto recomendado

Usa backend remoto por ambiente, con keys separadas:

- `finanzasclaras/demo/terraform.tfstate`
- `finanzasclaras/staging/terraform.tfstate`
- `finanzasclaras/production/terraform.tfstate`

## Tamaño inicial recomendado

Para esta etapa:

- `demo` -> `t3a.small`
- `staging` -> `t3a.small`
- `production` -> `t3.small`

La idea es mantener bajo costo en los ambientes no productivos sin pasar todavía
a estrategias más complejas como autoscaling. Cuando la aplicación corra en un
servidor real, conviene medir consumo antes de subir capacidades.
