from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.models.user import utc_now


class Budget(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    periodo: str = Field(max_length=20)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    monto: float = Field(gt=0)
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    activo: bool = True
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)
