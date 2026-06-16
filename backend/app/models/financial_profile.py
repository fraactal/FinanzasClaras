from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.user import utc_now


class FinancialProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id", unique=True)
    ingreso_mensual_estimado: Optional[float] = Field(default=None, ge=0)
    meta_ahorro_mensual: Optional[float] = Field(default=None, ge=0)
    dia_pago_estimado: Optional[int] = Field(default=None, ge=1, le=31)
    moneda: str = Field(default="CLP", max_length=10)
    pais: str = Field(default="Chile", max_length=100)
    objetivo_financiero_principal: Optional[str] = Field(default=None, max_length=120)
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)
