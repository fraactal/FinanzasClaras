from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FinancialProfileUpsert(BaseModel):
    ingreso_mensual_estimado: Optional[float] = Field(default=None, ge=0)
    meta_ahorro_mensual: Optional[float] = Field(default=None, ge=0)
    dia_pago_estimado: Optional[int] = Field(default=None, ge=1, le=31)
    moneda: str = Field(default="CLP", max_length=10)
    pais: str = Field(default="Chile", max_length=100)
    objetivo_financiero_principal: Optional[str] = Field(default=None, max_length=120)


class FinancialProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    ingreso_mensual_estimado: Optional[float]
    meta_ahorro_mensual: Optional[float]
    dia_pago_estimado: Optional[int]
    moneda: str
    pais: str
    objetivo_financiero_principal: Optional[str]
    created_at: datetime
    updated_at: datetime
