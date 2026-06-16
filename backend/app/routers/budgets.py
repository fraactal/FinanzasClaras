from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models.budget import Budget
from app.models.category import Category
from app.models.user import User, utc_now
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetUpdate


router = APIRouter(prefix="/budgets", tags=["budgets"])


def _check_category(session: Session, current_user: User, category_id: int | None) -> None:
    if category_id is None:
        return
    category = session.get(Category, category_id)
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="La categoría no pertenece al usuario.")


@router.get("", response_model=list[BudgetRead])
def list_budgets(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)) -> list[BudgetRead]:
    budgets = session.exec(select(Budget).where(Budget.user_id == current_user.id).order_by(Budget.fecha_inicio.desc())).all()
    return [BudgetRead.model_validate(item) for item in budgets]


@router.post("", response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BudgetRead:
    _check_category(session, current_user, payload.category_id)
    budget = Budget(user_id=current_user.id, **payload.model_dump())
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return BudgetRead.model_validate(budget)


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BudgetRead:
    budget = session.get(Budget, budget_id)
    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado.")
    updates = payload.model_dump(exclude_unset=True)
    if "category_id" in updates:
        _check_category(session, current_user, updates["category_id"])
    for key, value in updates.items():
        setattr(budget, key, value)
    budget.updated_at = utc_now()
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return BudgetRead.model_validate(budget)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    budget = session.get(Budget, budget_id)
    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado.")
    session.delete(budget)
    session.commit()
