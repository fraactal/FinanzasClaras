from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class BudgetCreate(BaseModel):
    periodo: str = Field(pattern="^(diario|semanal|mensual)$")
    category_id: Optional[int] = None
    monto: float = Field(gt=0)
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    activo: bool = True


class BudgetUpdate(BaseModel):
    periodo: Optional[str] = Field(default=None, pattern="^(diario|semanal|mensual)$")
    category_id: Optional[int] = None
    monto: Optional[float] = Field(default=None, gt=0)
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    activo: Optional[bool] = None


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    periodo: str
    category_id: Optional[int]
    monto: float
    fecha_inicio: date
    fecha_fin: Optional[date]
    activo: bool
    created_at: datetime
    updated_at: datetime
