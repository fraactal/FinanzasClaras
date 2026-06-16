# Finanzas Claras

MVP de gestión de gastos personales inspirado en el HTML base adjunto. El proyecto convierte ese prototipo visual en una aplicación real con autenticación, persistencia, reportes y estructura lista para evolucionar a SaaS.

## Objetivo del MVP

Ayudar a una persona a:

- Registrar gastos diarios de forma simple.
- Entender cuánto gastó hoy, esta semana y este mes.
- Definir topes y presupuestos.
- Ver alertas cuando se acerca o supera un límite.
- Entender en qué categorías se le va el dinero.
- Recibir consejos básicos y responsables de educación financiera.

## Stack utilizado

- Backend: FastAPI
- Base de datos: SQLite
- ORM: SQLModel
- Auth: JWT con email y contraseña
- Hash de contraseñas: Passlib con bcrypt
- Frontend: React + TypeScript + Vite
- Estilos: CSS custom inspirado en el HTML base
- Contenedores: Docker y Docker Compose

## Estructura del proyecto

```text
backend/
  app/
    auth.py
    config.py
    database.py
    main.py
    models/
    routers/
    schemas/
    services/
  Dockerfile
  requirements.txt
frontend/
  src/
    components/
    hooks/
    pages/
    services/
    styles/
    main.tsx
  Dockerfile
  index.html
  package.json
docker-compose.yml
.env.example
README.md
```

## Cómo ejecutar localmente

1. Crear el archivo `.env` a partir de `.env.example`.
2. Ejecutar:

```bash
docker compose up --build
```

3. Abrir:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
- Docs API: [http://localhost:8000/docs](http://localhost:8000/docs)

## Variables de entorno

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

## Repositorio

Actualmente esta carpeta no estÃ¡ inicializada como repositorio Git. Para conectarla a un remoto y usar Jenkins sobre la rama `main`, el flujo esperado es:

```bash
git init -b main
git add .
git commit -m "Initial demo setup"
git remote add origin <URL-DEL-REPO>
git push -u origin main
```

## Base de datos

- La base queda persistida en `data/app.db` dentro del contenedor backend.
- `docker-compose.yml` monta un volumen Docker llamado `sqlite_data` para no perder información.
- El modelado quedó pensado para migrar más adelante a PostgreSQL sin cambiar la lógica principal.

## Funcionalidades implementadas

### Autenticación

- Registro con nombre, email y contraseña.
- Login con JWT.
- Recuperación de contraseña desde login con enlace temporal de desarrollo.
- Endpoint `GET /api/auth/me`.
- Logout resuelto desde frontend limpiando el token.
- Rutas privadas protegidas en frontend.

### Gastos

- Crear, listar, editar y eliminar gastos.
- Filtros por fecha, rango, categoría, método de pago y tipo.
- Registro rápido desde el dashboard.

### Categorías

- Categorías por usuario.
- Seed inicial con categorías inspiradas en el HTML base.
- Crear, ocultar/activar y eliminar categorías.

### Presupuestos

- Soporte para presupuesto diario, semanal y mensual.
- Presupuesto opcional por categoría.
- Cálculo de porcentaje usado, restante y estado visual.

### Reportes

- Diario: total, mensaje, movimientos y categorías.
- Semanal: total, promedio, mayor gasto, días con movimiento y desglose.
- Mensual: total, promedio, proyección, resumen por semanas y categorías.

### Perfil financiero

- Ingreso mensual estimado.
- Meta de ahorro mensual.
- Día de pago estimado.
- Moneda y país.
- Objetivo financiero principal.

### Aprende

- Tips de educación financiera básica.
- Consejo del día simple.

## Endpoints principales

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users/deactivate-by-email`
- `POST /api/admin/users/reactivate-by-email`
- `GET /api/admin/system-overview`

Estos endpoints requieren iniciar sesión con una cuenta administradora.

### Usuarios

- `GET /api/users/me`
- `PATCH /api/users/me`

### Perfil financiero

- `GET /api/financial-profile`
- `PUT /api/financial-profile`

### Categorías

- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Gastos

- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/{id}`
- `PATCH /api/expenses/{id}`
- `DELETE /api/expenses/{id}`

Filtros disponibles en `GET /api/expenses`:

- `date`
- `from_date`
- `to_date`
- `category_id`
- `payment_method`
- `type`

### Presupuestos

- `GET /api/budgets`
- `POST /api/budgets`
- `PATCH /api/budgets/{id}`
- `DELETE /api/budgets/{id}`

### Resúmenes

- `GET /api/reports/daily?date=YYYY-MM-DD`
- `GET /api/reports/weekly?date=YYYY-MM-DD`
- `GET /api/reports/monthly?year=YYYY&month=MM`
- `GET /api/reports/category-summary?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`

## Cómo usar la app

1. Crear una cuenta.
2. Entrar al dashboard.
3. Registrar gastos manuales o con botones rápidos.
4. Revisar las vistas Hoy, Semana y Mes.
5. Definir topes en la sección Presupuestos.
6. Ajustar categorías y perfil financiero.
7. Revisar la sección Aprende para recomendaciones simples.

## Seguridad básica aplicada

- Password hashing con bcrypt.
- Validación de email.
- Validación de montos positivos.
- Aislamiento de datos por usuario.
- Variables sensibles vía `.env`.
- CORS configurable.
- Contraseñas nunca se guardan en texto plano.
- Desactivación lógica de usuarios para evitar borrar historial y romper relaciones.

## Cuenta administradora

La aplicación puede sembrar una cuenta administradora automáticamente al iniciar si `ADMIN_SYNC_ON_STARTUP=true`.

Variables relevantes:

- `ADMIN_BOOTSTRAP_NAME`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ADMIN_SYNC_ON_STARTUP`

Si necesitas recuperar la contraseña de la cuenta admin:

1. Cambia `ADMIN_BOOTSTRAP_PASSWORD` en `.env`.
2. Reinicia los contenedores.
3. La contraseña de la cuenta administradora se actualizará en el arranque.

## Autenticación con Google a futuro

El proyecto quedó preparado para crecer hacia OAuth, pero no se implementó Google en esta primera versión para mantener el MVP liviano, barato y fácil de desplegar. Cuando el producto tenga usuarios reales o ingresos, se puede agregar:

- Login con Google OAuth 2.0.
- Vinculación de cuentas locales con proveedor externo.
- Manejo de refresh tokens y revocación.
- Revisión de seguridad y flujos de recuperación.

## Futuras mejoras para versión SaaS

- Google OAuth.
- Recuperación de contraseña por email.
- Plan gratuito y plan premium.
- Suscripciones con Stripe, Mercado Pago o Flow.
- Exportación a Excel y PDF.
- Reportes inteligentes.
- IA para detectar gastos hormiga.
- Recordatorios por email o WhatsApp.
- Multi-moneda.
- Metas de ahorro más avanzadas.
- Modo familiar.
- Integración bancaria futura, con evaluación legal y de seguridad.

## Próximos pasos recomendados

1. Agregar migraciones con Alembic.
2. Mover el frontend a componentes más desacoplados y formularios reutilizables.
3. Sumar edición visual de gastos desde el dashboard.
4. Añadir tests para auth, ownership y reportes.
5. Preparar despliegue con PostgreSQL para producción.

## Demo productiva con Jenkins y Terraform

Se agregÃ³ una ruta de despliegue orientada a demo productiva sobre una sola VM EC2:

- [`Jenkinsfile`](C:/Users/Jona/Documents/FinanzasClaras/Jenkinsfile): pipeline para aplicar Terraform y desplegar en la VM al hacer push a `main`.
- [`docker-compose.prod.yml`](C:/Users/Jona/Documents/FinanzasClaras/docker-compose.prod.yml): despliegue productivo con backend privado y frontend servido por Nginx.
- [`frontend/Dockerfile.prod`](C:/Users/Jona/Documents/FinanzasClaras/frontend/Dockerfile.prod): build estÃ¡tico del frontend.
- [`infra/terraform`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform): infraestructura demo en AWS EC2.

### Estrategia del usuario administrador

Para no depender de un `.env` versionado, el flujo de demo queda preparado para:

- Desactivar el bootstrap permanente con `ADMIN_SYNC_ON_STARTUP=false`.
- Guardar el correo, nombre y contraseÃ±a del admin como credenciales de Jenkins.
- Ejecutar un seed directo a la base de datos tras el deploy usando [`backend/app/scripts/seed_admin.py`](C:/Users/Jona/Documents/FinanzasClaras/backend/app/scripts/seed_admin.py).

Eso evita dejar la clave del admin en el repo y tambiÃ©n evita que la app la reescriba en cada reinicio.

### Credenciales esperadas en Jenkins

El `Jenkinsfile` asume estos `credentialsId`:

- `aws-access-key-id`
- `aws-secret-access-key`
- `demo-vm-public-key`
- `demo-vm-ssh-key`
- `finanzas-claras-demo-env`
- `admin-demo-name`
- `admin-demo-email`
- `admin-demo-password`

`finanzas-claras-demo-env` debe ser un archivo `.env` basado en [`.env.production.example`](C:/Users/Jona/Documents/FinanzasClaras/.env.production.example).

### Variables Terraform

El pipeline usa [`infra/terraform/terraform.tfvars.example`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform/terraform.tfvars.example) como referencia y sobreescribe variables sensibles desde Jenkins.

### Supuestos de esta demo

- Proveedor: AWS.
- Infraestructura: una sola VM EC2.
- Persistencia: SQLite en volumen Docker.
- Entrada pÃºblica: HTTP por puerto 80.

Para producciÃ³n real, el siguiente salto correcto es:

1. Migrar a PostgreSQL administrado.
2. Mover el estado de Terraform a backend remoto S3 + DynamoDB.
3. Agregar HTTPS con dominio y reverse proxy administrado o balanceador.
4. Reemplazar SQLite por backups y restauraciÃ³n reales.

## Jenkins local

Para revisar el pipeline localmente sin instalar Java en Windows, se agregÃ³ un Jenkins en Docker:

- [`docker-compose.jenkins.yml`](C:/Users/Jona/Documents/FinanzasClaras/docker-compose.jenkins.yml)
- [`infra/jenkins-local/Dockerfile`](C:/Users/Jona/Documents/FinanzasClaras/infra/jenkins-local/Dockerfile)

Levantar:

```bash
docker-compose -f docker-compose.jenkins.yml up --build -d
```

Acceso:

- Jenkins: [http://localhost:8081](http://localhost:8081)

Dentro de Jenkins, el repo queda montado en:

```text
/workspace/FinanzasClaras
```

Para la demo local, crea un Pipeline job apuntando al `Jenkinsfile` del repo y carga las mismas credenciales documentadas en la secciÃ³n anterior.

## Observaciones

- El proyecto fue dejado como MVP funcional y claro.
- No se implementó Google OAuth ni pagos.
- La recuperación de contraseña no envía emails reales todavía; en modo desarrollo devuelve un enlace temporal para completar el flujo desde el frontend.
- No se ejecutaron contenedores ni instalación de dependencias en este entorno, por lo que la validación final de ejecución queda pendiente de correr localmente con Docker.
