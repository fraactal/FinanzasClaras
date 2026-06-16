from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    _run_sqlite_migrations()


def _run_sqlite_migrations() -> None:
    if not settings.database_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        user_columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(user)").fetchall()}
        if "is_active" not in user_columns:
            connection.exec_driver_sql("ALTER TABLE user ADD COLUMN is_active BOOLEAN DEFAULT 1")
        connection.exec_driver_sql("UPDATE user SET is_active = 1 WHERE is_active IS NULL")
        if "is_admin" not in user_columns:
            connection.exec_driver_sql("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        connection.exec_driver_sql("UPDATE user SET is_admin = 0 WHERE is_admin IS NULL")

        columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(category)").fetchall()}
        if "order_position" not in columns:
            connection.exec_driver_sql("ALTER TABLE category ADD COLUMN order_position INTEGER DEFAULT 0")
        connection.exec_driver_sql(
            """
            UPDATE category
            SET order_position = id
            WHERE order_position IS NULL OR order_position = 0
            """
        )


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
