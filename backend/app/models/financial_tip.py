from typing import Optional

from sqlmodel import Field, SQLModel


class FinancialTip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str = Field(max_length=120)
    contenido: str = Field(max_length=300)
    activo: bool = True
