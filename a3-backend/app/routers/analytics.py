from collections import Counter
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_developer
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["analytics"])


@router.get("/analytics", response_model=schemas.AnalyticsOut)
def get_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(require_developer)):
    products = db.query(models.Product).all()
    reviews = db.query(models.Review).all()
    cases = db.query(models.CustomerCase).all()

    sentiment_counts = Counter(r.sentiment.value for r in reviews if r.sentiment)
    severity_counts = Counter(c.severity.value for c in cases)
    status_counts = Counter(c.status.value for c in cases)

    # Review trend: reviews per calendar day (last 30 entries by date bucket)
    trend_buckets: dict[str, int] = {}
    for r in reviews:
        day = r.created_at.strftime("%Y-%m-%d")
        trend_buckets[day] = trend_buckets.get(day, 0) + 1
    review_trend = [{"date": d, "count": c} for d, c in sorted(trend_buckets.items())]

    resolved = [
        c for c in cases if c.status in (models.CaseStatus.RESOLVED, models.CaseStatus.CLOSED) and c.updated_at
    ]
    if resolved:
        total_hours = sum((c.updated_at - c.created_at).total_seconds() / 3600 for c in resolved)
        avg_resolution_hours = round(total_hours / len(resolved), 2)
    else:
        avg_resolution_hours = None

    return schemas.AnalyticsOut(
        total_products=len(products),
        total_reviews=len(reviews),
        total_cases=len(cases),
        open_cases=sum(1 for c in cases if c.status == models.CaseStatus.OPEN),
        sentiment_distribution=dict(sentiment_counts),
        severity_distribution=dict(severity_counts),
        case_status_distribution=dict(status_counts),
        review_trend=review_trend,
        avg_resolution_hours=avg_resolution_hours,
    )
