# Finanzas Claras

MVP de gestión de gastos personales con FastAPI, React y despliegue preparado
para Jenkins centralizado y Terraform por ambiente.

## Stack

- Backend: FastAPI
- Frontend: React + TypeScript + Vite
- Base de datos: SQLite
- Infraestructura: Terraform
- Despliegue: Docker Compose
- CI/CD: Jenkins centralizado

## Estructura

```text
backend/
frontend/
infra/
  terraform/
AGENTS.md
Jenkinsfile
docker-compose.yml
docker-compose.prod.yml
README.md
```

## Desarrollo local

1. Crear `.env` a partir de `.env.example`
2. Levantar:

```bash
docker-compose up --build
```

3. Abrir:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

## Variables de entorno de ejemplo

```env
JWT_SECRET=change-this-secret-in-production
DATABASE_URL=sqlite:///data/app.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=1440
PASSWORD_RESET_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
EXPOSE_RESET_TOKEN_IN_DEV=true
PUBLIC_PASSWORD_RECOVERY_ENABLED=false
ADMIN_BOOTSTRAP_NAME=Administrador Finanzas Claras
ADMIN_BOOTSTRAP_EMAIL=admin@finanzasclaras.local
ADMIN_BOOTSTRAP_PASSWORD=ChangeAdmin123!
ADMIN_SYNC_ON_STARTUP=true
```

## CI/CD centralizado

Este repositorio está preparado para integrarse con un Jenkins centralizado que
vive fuera de esta aplicación.

### Archivos de automatización que pertenecen a este repo

- [`AGENTS.md`](C:/Users/Jona/Documents/FinanzasClaras/AGENTS.md)
- [`Jenkinsfile`](C:/Users/Jona/Documents/FinanzasClaras/Jenkinsfile)
- [`infra/terraform`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform)
- [`docker-compose.prod.yml`](C:/Users/Jona/Documents/FinanzasClaras/docker-compose.prod.yml)

### Mapeo de ambientes

- `develop` -> `demo`
- `staging` -> `staging`
- `main` -> `production`

### Credenciales esperadas en Jenkins

- `finanzasclaras-repo-git-ssh`
- `finanzasclaras-demo-aws-access-key-id`
- `finanzasclaras-demo-aws-secret-access-key`
- `finanzasclaras-demo-vm-public-key`
- `finanzasclaras-demo-vm-ssh`
- `finanzasclaras-demo-env-file`
- `finanzasclaras-demo-admin-name`
- `finanzasclaras-demo-admin-email`
- `finanzasclaras-demo-admin-password`
- `finanzasclaras-demo-tf-backend`
- `finanzasclaras-staging-aws-access-key-id`
- `finanzasclaras-staging-aws-secret-access-key`
- `finanzasclaras-staging-vm-public-key`
- `finanzasclaras-staging-vm-ssh`
- `finanzasclaras-staging-env-file`
- `finanzasclaras-staging-admin-name`
- `finanzasclaras-staging-admin-email`
- `finanzasclaras-staging-admin-password`
- `finanzasclaras-staging-tf-backend`
- `finanzasclaras-production-aws-access-key-id`
- `finanzasclaras-production-aws-secret-access-key`
- `finanzasclaras-production-vm-public-key`
- `finanzasclaras-production-vm-ssh`
- `finanzasclaras-production-env-file`
- `finanzasclaras-production-admin-name`
- `finanzasclaras-production-admin-email`
- `finanzasclaras-production-admin-password`
- `finanzasclaras-production-tf-backend`

### Terraform por ambiente

Los backends y variables de ejemplo viven por ambiente en:

- [`infra/terraform/backend`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform/backend)
- [`infra/terraform/environments`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform/environments)

## Nota operativa

- Jenkins está centralizado y no debe reconstruirse desde este repositorio.
- Terraform sigue viviendo en este repositorio.
- Los secretos nunca deben guardarse en Git.
