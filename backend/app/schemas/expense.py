from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    category_id: int
    descripcion: str = Field(min_length=1, max_length=255)
    monto: float = Field(gt=0)
    fecha_gasto: date
    tipo: str = Field(default="gasto", max_length=20)
    metodo_pago: Optional[str] = Field(default=None, max_length=30)
    nota: Optional[str] = Field(default=None, max_length=500)


class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    descripcion: Optional[str] = Field(default=None, min_length=1, max_length=255)
    monto: Optional[float] = Field(default=None, gt=0)
    fecha_gasto: Optional[date] = None
    tipo: Optional[str] = Field(default=None, max_length=20)
    metodo_pago: Optional[str] = Field(default=None, max_length=30)
    nota: Optional[str] = Field(default=None, max_length=500)


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    category_id: int
    descripcion: str
    monto: float
    fecha_gasto: date
    tipo: str
    metodo_pago: Optional[str]
    nota: Optional[str]
    created_at: datetime
    updated_at: datetime
