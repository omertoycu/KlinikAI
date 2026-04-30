from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import verify_admin
from app.models.appointment import Appointment

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _past_months(n: int) -> list[tuple[int, int]]:
    now = datetime.utcnow()
    result = []
    for i in range(n - 1, -1, -1):
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        result.append((year, month))
    return result


@router.get("/summary")
def summary(db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    now = datetime.utcnow()

    start_month = datetime(now.year, now.month, 1)
    if now.month == 12:
        end_month = datetime(now.year + 1, 1, 1)
    else:
        end_month = datetime(now.year, now.month + 1, 1)

    month_apts = (
        db.query(Appointment)
        .filter(Appointment.datetime >= start_month, Appointment.datetime < end_month)
        .all()
    )
    total_month = len(month_apts)

    by_status: dict[str, int] = defaultdict(int)
    hour_counter: Counter = Counter()
    for apt in month_apts:
        s = apt.status or "pending"
        by_status[s] += 1
        if s != "cancelled":
            hour_counter[apt.datetime.hour] += 1

    total_all = db.query(func.count(Appointment.id)).scalar() or 0

    by_hour = sorted(
        [{"hour": h, "count": c} for h, c in hour_counter.items()],
        key=lambda x: -x["count"],
    )

    months = _past_months(7)
    start_trend = datetime(months[0][0], months[0][1], 1)
    trend_rows = (
        db.query(Appointment.datetime)
        .filter(Appointment.datetime >= start_trend)
        .all()
    )

    monthly_counts: dict[tuple, int] = defaultdict(int)
    for (dt,) in trend_rows:
        monthly_counts[(dt.year, dt.month)] += 1

    month_names = [
        "Oca", "Şub", "Mar", "Nis", "May", "Haz",
        "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
    ]
    monthly_trend = [
        {"label": f"{month_names[m - 1]} {y}", "count": monthly_counts.get((y, m), 0)}
        for y, m in months
    ]

    confirmed = by_status.get("confirmed", 0) + by_status.get("pending", 0)
    cancelled = by_status.get("cancelled", 0)
    no_show_rate = round((cancelled / total_month * 100) if total_month > 0 else 0, 1)

    return {
        "total_this_month": total_month,
        "total_all_time": total_all,
        "confirmed_this_month": confirmed,
        "cancelled_this_month": cancelled,
        "no_show_rate": no_show_rate,
        "by_status": dict(by_status),
        "by_hour": by_hour,
        "monthly_trend": monthly_trend,
    }
