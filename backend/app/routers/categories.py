from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.auth import get_current_user
from app.database import get_session
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.models.user import User, utc_now
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate


router = APIRouter(prefix="/categories", tags=["categories"])

FALLBACK_CATEGORY_NAME = "Otros"
FALLBACK_CATEGORY_EMOJI = "🧾"
FALLBACK_CATEGORY_COLOR = "#8b806b"


def _find_fallback_category(session: Session, user_id: int) -> Category | None:
    return session.exec(
        select(Category).where(Category.user_id == user_id, Category.nombre == FALLBACK_CATEGORY_NAME).order_by(Category.created_at)
    ).first()


def _ensure_fallback_category(session: Session, current_user: User) -> Category:
    fallback = _find_fallback_category(session, current_user.id)
    if fallback:
        return fallback

    next_position = session.exec(select(func.max(Category.order_position)).where(Category.user_id == current_user.id)).one()
    fallback = Category(
        user_id=current_user.id,
        nombre=FALLBACK_CATEGORY_NAME,
        emoji=FALLBACK_CATEGORY_EMOJI,
        color=FALLBACK_CATEGORY_COLOR,
        order_position=(next_position or 0) + 1,
        activa=True,
    )
    session.add(fallback)
    session.commit()
    session.refresh(fallback)
    return fallback


@router.get("", response_model=list[CategoryRead])
def list_categories(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)) -> list[CategoryRead]:
    categories = session.exec(
        select(Category).where(Category.user_id == current_user.id).order_by(Category.order_position, Category.created_at)
    ).all()
    return [CategoryRead.model_validate(item) for item in categories]


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CategoryRead:
    data = payload.model_dump(exclude_unset=True)
    next_position = session.exec(select(func.max(Category.order_position)).where(Category.user_id == current_user.id)).one()
    data["order_position"] = data.get("order_position") if data.get("order_position") is not None else (next_position or 0) + 1
    category = Category(user_id=current_user.id, **data)
    session.add(category)
    session.commit()
    session.refresh(category)
    return CategoryRead.model_validate(category)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CategoryRead:
    category = session.get(Category, category_id)
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    category.updated_at = utc_now()
    session.add(category)
    session.commit()
    session.refresh(category)
    return CategoryRead.model_validate(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    category = session.get(Category, category_id)
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")

    if category.nombre == FALLBACK_CATEGORY_NAME:
        raise HTTPException(
            status_code=400,
            detail="La categoría Otros es la categoría de respaldo y no se puede eliminar.",
        )

    fallback = _ensure_fallback_category(session, current_user)

    expenses = session.exec(
        select(Expense).where(Expense.user_id == current_user.id, Expense.category_id == category.id)
    ).all()
    for expense in expenses:
        expense.category_id = fallback.id
        expense.updated_at = utc_now()
        session.add(expense)

    budgets = session.exec(
        select(Budget).where(Budget.user_id == current_user.id, Budget.category_id == category.id)
    ).all()
    for budget in budgets:
        budget.category_id = fallback.id
        budget.updated_at = utc_now()
        session.add(budget)

    session.delete(category)
    session.commit()
