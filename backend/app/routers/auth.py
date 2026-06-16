from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.auth import (
    create_access_token,
    create_password_reset_token,
    get_current_user,
    hash_password,
    verify_password,
    verify_password_reset_token,
)
from app.config import settings
from app.database import get_session
from app.models.user import User, utc_now
from app.schemas.auth import (
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.bootstrap import create_default_user_data


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, session: Session = Depends(get_session)) -> TokenResponse:
    existing = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con ese email.")

    user = User(
        nombre=payload.nombre.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    create_default_user_data(session, user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, session: Session = Depends(get_session)) -> TokenResponse:
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email o contraseña inválidos.")
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta está inactiva. Contacta al administrador para reactivarla.",
        )
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "Cierre de sesión gestionado por el frontend."}


@router.post("/forgot-password", response_model=PasswordResetRequestResponse)
def forgot_password(
    payload: PasswordResetRequest,
    session: Session = Depends(get_session),
) -> PasswordResetRequestResponse:
    if not settings.public_password_recovery_enabled:
        raise HTTPException(
            status_code=403,
            detail="La recuperación pública de contraseña está deshabilitada.",
        )

    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    message = "Si el correo existe, recibirás instrucciones para restablecer tu contraseña."
    if not user:
        return PasswordResetRequestResponse(message=message)

    token = create_password_reset_token(user.id)
    reset_url = None
    if settings.expose_reset_token_in_dev:
        reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    return PasswordResetRequestResponse(message=message, reset_url=reset_url)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: PasswordResetConfirm,
    session: Session = Depends(get_session),
) -> MessageResponse:
    user_id = verify_password_reset_token(payload.token)
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    user.password_hash = hash_password(payload.new_password)
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
    return MessageResponse(message="Tu contraseña fue actualizada. Ya puedes iniciar sesión.")
