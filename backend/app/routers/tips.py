from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models.financial_tip import FinancialTip
from app.models.user import User
from app.schemas.tip import FinancialTipRead


router = APIRouter(prefix="/tips", tags=["tips"])


@router.get("", response_model=list[FinancialTipRead])
def list_tips(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[FinancialTipRead]:
    tips = session.exec(select(FinancialTip).where(FinancialTip.activo == True)).all()  # noqa: E712
    return [FinancialTipRead.model_validate(item) for item in tips]
