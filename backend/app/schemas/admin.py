from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminUserEmailAction(BaseModel):
    email: EmailStr


class AdminUserStatusResponse(BaseModel):
    message: str
    email: EmailStr
    is_active: bool


class AdminUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: EmailStr
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime


class AdminSystemOverview(BaseModel):
    google_oauth_configured: bool
    password_reset_email_delivery: bool
    expose_reset_token_in_dev: bool
    frontend_url: str
    admin_sync_on_startup: bool
    notes: list[str]
