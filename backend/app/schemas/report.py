from datetime import date
from typing import Optional

from pydantic import BaseModel


class CategoryTotal(BaseModel):
    category_id: int
    nombre: str
    emoji: str
    total: float


class ExpenseItem(BaseModel):
    id: int
    descripcion: str
    monto: float
    fecha_gasto: date
    tipo: str
    metodo_pago: Optional[str]
    categoria: str
    emoji: str


class BudgetStatus(BaseModel):
    presupuesto: Optional[float]
    restante: Optional[float]
    porcentaje_usado: Optional[float]
    estado: str


class DailyReport(BaseModel):
    fecha: date
    total: float
    presupuesto: BudgetStatus
    categorias: list[CategoryTotal]
    movimientos: list[ExpenseItem]
    mensaje: str


class WeeklyDay(BaseModel):
    fecha: date
    total: float


class WeeklyReport(BaseModel):
    desde: date
    hasta: date
    total: float
    promedio_diario: float
    mayor_gasto_dia: float
    dias_con_gasto: int
    dias: list[WeeklyDay]
    categorias: list[CategoryTotal]
    presupuesto: BudgetStatus


class MonthlyWeek(BaseModel):
    etiqueta: str
    total: float


class MonthlyReport(BaseModel):
    year: int
    month: int
    total: float
    promedio_diario: float
    proyeccion: Optional[float]
    dias_con_gasto: int
    dias_del_mes: int
    semanas: list[MonthlyWeek]
    categorias: list[CategoryTotal]
    presupuesto: BudgetStatus


class CategorySummaryReport(BaseModel):
    from_date: date
    to_date: date
    categorias: list[CategoryTotal]
