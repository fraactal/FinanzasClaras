from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Finanzas Claras"
    api_prefix: str = "/api"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "sqlite:///data/app.db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    password_reset_expire_minutes: int = 30
    frontend_url: str = "http://localhost:5173"
    expose_reset_token_in_dev: bool = False
    public_password_recovery_enabled: bool = False
    admin_api_key: str = "change-admin-key"
    admin_bootstrap_name: str = "Administrador Finanzas Claras"
    admin_bootstrap_email: str = "admin@finanzasclaras.local"
    admin_bootstrap_password: str = "ChangeAdmin123!"
    admin_sync_on_startup: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @computed_field
    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
