from collections import defaultdict
from datetime import date, timedelta
from typing import Iterable

from sqlmodel import Session, select

from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.report import (
    BudgetStatus,
    CategorySummaryReport,
    CategoryTotal,
    DailyReport,
    ExpenseItem,
    MonthlyReport,
    MonthlyWeek,
    WeeklyDay,
    WeeklyReport,
)


def _budget_status(spent: float, budget: Budget | None) -> BudgetStatus:
    if not budget:
        return BudgetStatus(presupuesto=None, restante=None, porcentaje_usado=None, estado="sin_tope")
    percentage = (spent / budget.monto) * 100 if budget.monto else 0
    if percentage >= 100:
        state = "danger"
    elif percentage >= 75:
        state = "warning"
    else:
        state = "ok"
    return BudgetStatus(
        presupuesto=budget.monto,
        restante=budget.monto - spent,
        porcentaje_usado=round(percentage, 2),
        estado=state,
    )


def _find_budget(session: Session, user_id: int, periodo: str, target_date: date) -> Budget | None:
    statement = select(Budget).where(
        Budget.user_id == user_id,
        Budget.periodo == periodo,
        Budget.activo == True,  # noqa: E712
        Budget.category_id == None,  # noqa: E711
        Budget.fecha_inicio <= target_date,
    )
    budgets = session.exec(statement).all()
    valid = [b for b in budgets if b.fecha_fin is None or b.fecha_fin >= target_date]
    valid.sort(key=lambda item: item.fecha_inicio, reverse=True)
    return valid[0] if valid else None


def _category_map(session: Session, user_id: int) -> dict[int, Category]:
    rows = session.exec(select(Category).where(Category.user_id == user_id)).all()
    return {row.id: row for row in rows}


def _category_totals(expenses: Iterable[Expense], categories: dict[int, Category]) -> list[CategoryTotal]:
    totals: dict[int, float] = defaultdict(float)
    for expense in expenses:
        totals[expense.category_id] += expense.monto
    result = []
    for category_id, total in totals.items():
        cat = categories.get(category_id)
        if not cat:
            continue
        result.append(CategoryTotal(category_id=category_id, nombre=cat.nombre, emoji=cat.emoji, total=round(total, 2)))
    return sorted(result, key=lambda item: item.total, reverse=True)


def daily_report(session: Session, user_id: int, target_date: date) -> DailyReport:
    categories = _category_map(session, user_id)
    expenses = session.exec(
        select(Expense).where(Expense.user_id == user_id, Expense.fecha_gasto == target_date).order_by(Expense.created_at.desc())
    ).all()
    total = round(sum(item.monto for item in expenses), 2)
    budget_status = _budget_status(total, _find_budget(session, user_id, "diario", target_date))
    movimientos = [
        ExpenseItem(
            id=item.id,
            descripcion=item.descripcion,
            monto=item.monto,
            fecha_gasto=item.fecha_gasto,
            tipo=item.tipo,
            metodo_pago=item.metodo_pago,
            categoria=categories[item.category_id].nombre if item.category_id in categories else "Sin categoría",
            emoji=categories[item.category_id].emoji if item.category_id in categories else "💸",
        )
        for item in expenses
    ]
    if total == 0:
        message = "Aún no registras gastos hoy."
    elif budget_status.estado == "danger":
        message = "Superaste tu tope diario."
    elif budget_status.estado == "warning":
        message = "Vas cerca de tu tope diario."
    else:
        message = "Tu gasto de hoy va bajo control."
    return DailyReport(
        fecha=target_date,
        total=total,
        presupuesto=budget_status,
        categorias=_category_totals(expenses, categories),
        movimientos=movimientos,
        mensaje=message,
    )


def weekly_report(session: Session, user_id: int, target_date: date) -> WeeklyReport:
    weekday = target_date.weekday()
    start = target_date - timedelta(days=weekday)
    end = start + timedelta(days=6)
    expenses = session.exec(
        select(Expense).where(
            Expense.user_id == user_id,
            Expense.fecha_gasto >= start,
            Expense.fecha_gasto <= end,
        )
    ).all()
    categories = _category_map(session, user_id)
    totals_by_day = []
    for offset in range(7):
        current = start + timedelta(days=offset)
        total = round(sum(item.monto for item in expenses if item.fecha_gasto == current), 2)
        totals_by_day.append(WeeklyDay(fecha=current, total=total))
    total = round(sum(item.total for item in totals_by_day), 2)
    days_with_expense = len([item for item in totals_by_day if item.total > 0])
    average = round(total / days_with_expense, 2) if days_with_expense else 0
    budget_status = _budget_status(total, _find_budget(session, user_id, "semanal", target_date))
    return WeeklyReport(
        desde=start,
        hasta=end,
        total=total,
        promedio_diario=average,
        mayor_gasto_dia=max((item.total for item in totals_by_day), default=0),
        dias_con_gasto=days_with_expense,
        dias=totals_by_day,
        categorias=_category_totals(expenses, categories),
        presupuesto=budget_status,
    )


def monthly_report(session: Session, user_id: int, year: int, month: int) -> MonthlyReport:
    start = date(year, month, 1)
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    end = next_month - timedelta(days=1)
    expenses = session.exec(
        select(Expense).where(
            Expense.user_id == user_id,
            Expense.fecha_gasto >= start,
            Expense.fecha_gasto <= end,
        )
    ).all()
    categories = _category_map(session, user_id)
    total = round(sum(item.monto for item in expenses), 2)
    totals_by_day: dict[date, float] = defaultdict(float)
    for expense in expenses:
        totals_by_day[expense.fecha_gasto] += expense.monto
    days_with_expense = len(totals_by_day)
    average = round(total / days_with_expense, 2) if days_with_expense else 0
    projection = round(average * end.day, 2) if days_with_expense else None

    weeks: list[MonthlyWeek] = []
    current = start
    week_start = current
    running_total = 0.0
    while current <= end:
        running_total += totals_by_day.get(current, 0.0)
        if current.weekday() == 6 or current == end:
            label = f"{week_start.day}-{current.day}"
            weeks.append(MonthlyWeek(etiqueta=label, total=round(running_total, 2)))
            running_total = 0.0
            week_start = current + timedelta(days=1)
        current += timedelta(days=1)

    budget_status = _budget_status(total, _find_budget(session, user_id, "mensual", start))
    return MonthlyReport(
        year=year,
        month=month,
        total=total,
        promedio_diario=average,
        proyeccion=projection,
        dias_con_gasto=days_with_expense,
        dias_del_mes=end.day,
        semanas=weeks,
        categorias=_category_totals(expenses, categories),
        presupuesto=budget_status,
    )


def category_summary(session: Session, user_id: int, from_date: date, to_date: date) -> CategorySummaryReport:
    expenses = session.exec(
        select(Expense).where(
            Expense.user_id == user_id,
            Expense.fecha_gasto >= from_date,
            Expense.fecha_gasto <= to_date,
        )
    ).all()
    return CategorySummaryReport(
        from_date=from_date,
        to_date=to_date,
        categorias=_category_totals(expenses, _category_map(session, user_id)),
    )
