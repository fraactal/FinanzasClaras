from sqlmodel import Session, select

from app.auth import hash_password
from app.config import settings
from app.models.category import Category
from app.models.financial_profile import FinancialProfile
from app.models.financial_tip import FinancialTip
from app.models.user import User, utc_now


DEFAULT_CATEGORIES = [
    ("Transporte", "🚗", "#4b6b4b"),
    ("Alimentación", "🍽️", "#5a8f5a"),
    ("Hidratación / Café / Bebidas", "☕", "#c9a84c"),
    ("Recreación", "🎉", "#7a8f4f"),
    ("Salud", "💊", "#b85c5c"),
    ("Hogar", "🏠", "#8ab88a"),
    ("Servicios", "💡", "#6e8f7b"),
    ("Deudas", "📉", "#9c5f5f"),
    ("Educación", "📚", "#5d7db3"),
    ("Otros", "🧾", "#8b806b"),
]

DEFAULT_TIPS = [
    ("Registra 7 días", "Si registras tus gastos por 7 días, descubrirás tus fugas de dinero."),
    ("Gastos hormiga", "Intenta que tus gastos hormiga no superen el 10% de tus ingresos."),
    ("Regla de 24 horas", "Antes de comprar algo no planificado, espera 24 horas."),
    ("Presupuesto antes del sueldo", "Define un presupuesto mensual antes de recibir tu sueldo."),
    ("Ordena por tipo", "Separa gastos fijos, variables y deseos para entender mejor tu dinero."),
]


def seed_financial_tips(session: Session) -> None:
    existing = session.exec(select(FinancialTip)).first()
    if existing:
        return
    for titulo, contenido in DEFAULT_TIPS:
        session.add(FinancialTip(titulo=titulo, contenido=contenido, activo=True))
    session.commit()


def create_default_user_data(session: Session, user: User) -> None:
    for index, (nombre, emoji, color) in enumerate(DEFAULT_CATEGORIES):
        session.add(
            Category(
                user_id=user.id,
                nombre=nombre,
                emoji=emoji,
                color=color,
                order_position=index,
                activa=True,
            )
        )

    session.add(
        FinancialProfile(
            user_id=user.id,
            moneda=user.moneda_preferida,
            pais=user.pais,
            objetivo_financiero_principal="ordenar gastos",
        )
    )
    session.commit()


def ensure_admin_user(session: Session) -> None:
    if not settings.admin_sync_on_startup:
        return

    email = settings.admin_bootstrap_email.lower().strip()
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        user = User(
            nombre=settings.admin_bootstrap_name,
            email=email,
            password_hash=hash_password(settings.admin_bootstrap_password),
            is_active=True,
            is_admin=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        create_default_user_data(session, user)
        return

    user.nombre = settings.admin_bootstrap_name
    user.password_hash = hash_password(settings.admin_bootstrap_password)
    user.is_active = True
    user.is_admin = True
    user.updated_at = utc_now()
    session.add(user)
    session.commit()
