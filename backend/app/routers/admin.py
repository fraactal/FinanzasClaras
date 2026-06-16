from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_admin_user
from app.config import settings
from app.database import get_session
from app.models.user import User, utc_now
from app.schemas.admin import AdminSystemOverview, AdminUserEmailAction, AdminUserRead, AdminUserStatusResponse


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserRead])
def list_users(
    email: str | None = None,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user),
) -> list[AdminUserRead]:
    statement = select(User).order_by(User.created_at.desc())
    if email:
        statement = statement.where(User.email.contains(email.lower()))
    users = session.exec(statement).all()
    return [AdminUserRead.model_validate(user) for user in users]


@router.post("/users/deactivate-by-email", response_model=AdminUserStatusResponse)
def deactivate_user_by_email(
    payload: AdminUserEmailAction,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user),
) -> AdminUserStatusResponse:
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta administradora.")
    user.is_active = False
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    return AdminUserStatusResponse(
        message="Usuario desactivado correctamente.",
        email=user.email,
        is_active=user.is_active,
    )


@router.post("/users/reactivate-by-email", response_model=AdminUserStatusResponse)
def reactivate_user_by_email(
    payload: AdminUserEmailAction,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user),
) -> AdminUserStatusResponse:
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    user.is_active = True
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    return AdminUserStatusResponse(
        message="Usuario reactivado correctamente.",
        email=user.email,
        is_active=user.is_active,
    )


@router.get("/system-overview", response_model=AdminSystemOverview)
def system_overview(current_admin: User = Depends(get_current_admin_user)) -> AdminSystemOverview:
    return AdminSystemOverview(
        google_oauth_configured=False,
        password_reset_email_delivery=False,
        expose_reset_token_in_dev=settings.expose_reset_token_in_dev,
        frontend_url=settings.frontend_url,
        admin_sync_on_startup=settings.admin_sync_on_startup,
        notes=[
            "Los secretos JWT, claves OAuth y credenciales SMTP deben seguir en variables de entorno.",
            "Para recuperar la cuenta admin, cambia ADMIN_BOOTSTRAP_PASSWORD en .env y reinicia los contenedores.",
            "Google OAuth y envío real de correos siguen pendientes para una etapa posterior.",
        ],
    )
