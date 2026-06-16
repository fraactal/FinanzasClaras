import argparse

from sqlmodel import Session, select

from app.auth import hash_password
from app.database import create_db_and_tables, engine
from app.models.user import User, utc_now
from app.services.bootstrap import create_default_user_data


def upsert_admin(name: str, email: str, password: str) -> None:
    normalized_email = email.lower().strip()
    create_db_and_tables()

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == normalized_email)).first()

        if not user:
            user = User(
                nombre=name,
                email=normalized_email,
                password_hash=hash_password(password),
                is_active=True,
                is_admin=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            create_default_user_data(session, user)
            return

        user.nombre = name
        user.password_hash = hash_password(password)
        user.is_active = True
        user.is_admin = True
        user.updated_at = utc_now()
        session.add(user)
        session.commit()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create or update the demo admin user directly in the database.")
    parser.add_argument("--name", required=True, help="Admin display name")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    upsert_admin(name=args.name, email=args.email, password=args.password)


if __name__ == "__main__":
    main()
