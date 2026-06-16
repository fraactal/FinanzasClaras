from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.user import utc_now


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    nombre: str = Field(max_length=100)
    emoji: str = Field(default="💸", max_length=10)
    color: Optional[str] = Field(default=None, max_length=30)
    order_position: int = Field(default=0, index=True)
    activa: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)
