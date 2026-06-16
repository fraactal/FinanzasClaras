from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, min_length=2, max_length=120)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str
    is_active: bool = Field(default=True, index=True)
    is_admin: bool = Field(default=False, index=True)
    moneda_preferida: str = Field(default="CLP", max_length=10)
    pais: str = Field(default="Chile", max_length=100)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)
