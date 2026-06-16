from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=120)
    moneda_preferida: Optional[str] = Field(default=None, max_length=10)
    pais: Optional[str] = Field(default=None, max_length=100)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: EmailStr
    is_admin: bool
    moneda_preferida: str
    pais: str
    created_at: datetime
    updated_at: datetime
