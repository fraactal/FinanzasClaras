from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.user import utc_now


class Expense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    category_id: int = Field(index=True, foreign_key="category.id")
    descripcion: str = Field(max_length=255)
    monto: float = Field(gt=0)
    fecha_gasto: date = Field(index=True)
    tipo: str = Field(default="gasto", max_length=20)
    metodo_pago: Optional[str] = Field(default=None, max_length=30)
    nota: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)
