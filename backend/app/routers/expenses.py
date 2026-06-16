from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User, utc_now
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate


router = APIRouter(prefix="/expenses", tags=["expenses"])


def _owned_category(session: Session, category_id: int, user_id: int) -> Category:
    category = session.get(Category, category_id)
    if not category or category.user_id != user_id:
        raise HTTPException(status_code=400, detail="La categoría no pertenece al usuario.")
    return category


@router.get("", response_model=list[ExpenseRead])
def list_expenses(
    date_value: Optional[date] = Query(default=None, alias="date"),
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    category_id: Optional[int] = None,
    payment_method: Optional[str] = None,
    type: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[ExpenseRead]:
    statement = select(Expense).where(Expense.user_id == current_user.id)
    if date_value:
        statement = statement.where(Expense.fecha_gasto == date_value)
    if from_date:
        statement = statement.where(Expense.fecha_gasto >= from_date)
    if to_date:
        statement = statement.where(Expense.fecha_gasto <= to_date)
    if category_id:
        statement = statement.where(Expense.category_id == category_id)
    if payment_method:
        statement = statement.where(Expense.metodo_pago == payment_method)
    if type:
        statement = statement.where(Expense.tipo == type)
    expenses = session.exec(statement.order_by(Expense.fecha_gasto.desc(), Expense.created_at.desc())).all()
    return [ExpenseRead.model_validate(item) for item in expenses]


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ExpenseRead:
    _owned_category(session, payload.category_id, current_user.id)
    expense = Expense(user_id=current_user.id, **payload.model_dump())
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return ExpenseRead.model_validate(expense)


@router.get("/{expense_id}", response_model=ExpenseRead)
def get_expense(
    expense_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ExpenseRead:
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado.")
    return ExpenseRead.model_validate(expense)


@router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ExpenseRead:
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado.")
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        _owned_category(session, updates["category_id"], current_user.id)
    for key, value in updates.items():
        setattr(expense, key, value)
    expense.updated_at = utc_now()
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return ExpenseRead.model_validate(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Gasto no encontrado.")
    session.delete(expense)
    session.commit()
