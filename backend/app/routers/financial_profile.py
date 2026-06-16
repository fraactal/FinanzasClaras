from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.models.financial_profile import FinancialProfile
from app.models.user import User, utc_now
from app.schemas.financial_profile import FinancialProfileRead, FinancialProfileUpsert


router = APIRouter(prefix="/financial-profile", tags=["financial-profile"])


@router.get("", response_model=FinancialProfileRead)
def get_profile(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)) -> FinancialProfileRead:
    profile = session.exec(select(FinancialProfile).where(FinancialProfile.user_id == current_user.id)).first()
    return FinancialProfileRead.model_validate(profile)


@router.put("", response_model=FinancialProfileRead)
def upsert_profile(
    payload: FinancialProfileUpsert,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> FinancialProfileRead:
    profile = session.exec(select(FinancialProfile).where(FinancialProfile.user_id == current_user.id)).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id, **payload.model_dump())
    else:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
        profile.updated_at = utc_now()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return FinancialProfileRead.model_validate(profile)
