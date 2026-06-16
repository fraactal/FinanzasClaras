from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_db_and_tables, engine
from app.routers import admin, auth, budgets, categories, expenses, financial_profile, reports, tips, users
from app.services.bootstrap import ensure_admin_user, seed_financial_tips
from sqlmodel import Session


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        seed_financial_tips(session)
        ensure_admin_user(session)


@app.get("/")
def health() -> dict[str, str]:
    return {"message": f"{settings.app_name} API activa"}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(financial_profile.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(expenses.router, prefix=settings.api_prefix)
app.include_router(budgets.router, prefix=settings.api_prefix)
app.include_router(reports.router, prefix=settings.api_prefix)
app.include_router(tips.router, prefix=settings.api_prefix)
