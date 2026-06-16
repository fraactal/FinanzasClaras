from pydantic import BaseModel, ConfigDict


class FinancialTipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    contenido: str
    activo: bool
