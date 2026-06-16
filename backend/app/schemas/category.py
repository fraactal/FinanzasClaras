from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    emoji: str = Field(default="💸", max_length=10)
    color: Optional[str] = Field(default=None, max_length=30)
    order_position: Optional[int] = None


class CategoryUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    emoji: Optional[str] = Field(default=None, max_length=10)
    color: Optional[str] = Field(default=None, max_length=30)
    order_position: Optional[int] = None
    activa: Optional[bool] = None


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    nombre: str
    emoji: str
    color: Optional[str]
    order_position: int
    activa: bool
    created_at: datetime
    updated_at: datetime
