from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.auth import get_current_user
from app.database import get_session
from app.models.category import Category
from app.models.user import User, utc_now
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate


router = APIRouter(prefix="/categories", tags=["categories"])


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
    session.delete(category)
    session.commit()
