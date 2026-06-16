from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.auth import get_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.report import CategorySummaryReport, DailyReport, MonthlyReport, WeeklyReport
from app.services.reports import category_summary, daily_report, monthly_report, weekly_report


router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily", response_model=DailyReport)
def get_daily_report(
    date_value: date = Query(alias="date"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> DailyReport:
    return daily_report(session, current_user.id, date_value)


@router.get("/weekly", response_model=WeeklyReport)
def get_weekly_report(
    date_value: date = Query(alias="date"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> WeeklyReport:
    return weekly_report(session, current_user.id, date_value)


@router.get("/monthly", response_model=MonthlyReport)
def get_monthly_report(
    year: int,
    month: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> MonthlyReport:
    return monthly_report(session, current_user.id, year, month)


@router.get("/category-summary", response_model=CategorySummaryReport)
def get_category_summary(
    from_date: date,
    to_date: date,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CategorySummaryReport:
    return category_summary(session, current_user.id, from_date, to_date)
