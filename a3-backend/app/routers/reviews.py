from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_customer
from app import models, schemas
from app.services import optimized_sentinel as sentinel  # Use optimized service for <50ms responses

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

# Sentiments/ratings that trigger an automatic customer case
CASE_TRIGGER_MAX_RATING = 2


def _severity_enum(value: str) -> models.Severity:
    return models.Severity(value)


def _sentiment_enum(value: str) -> models.Sentiment:
    return models.Sentiment(value)


@router.get("", response_model=list[schemas.ReviewOut])
def list_reviews(
    product_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Review)
    if product_id:
        query = query.filter(models.Review.product_id == product_id)
    if current_user.role == models.Role.CUSTOMER:
        # Customers only see their own reviews plus published ones on products
        query = query.filter(
            (models.Review.user_id == current_user.id) | (models.Review.status == models.ReviewStatus.PUBLISHED)
        )
    return query.order_by(models.Review.created_at.desc()).all()


@router.post("/analyze", response_model=schemas.ReviewAnalyzeResponse)
def analyze_review(
    payload: schemas.ReviewAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_customer),
):
    """
    Mirrors AIService.analyzeReview(). Runs the Product Sentinel analysis on
    review text WITHOUT persisting a review yet — used by the "Write a
    Review" flow before the customer confirms submission.
    
    Optimized for <50ms response time using 2000+ keyword mappings.
    """
    product = db.get(models.Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    analysis = sentinel.analyze_review_v2(payload.review_text, payload.rating, product.title, product.category)
    return schemas.ReviewAnalyzeResponse(
        analysis=schemas.SentinelAnalysisOut(**analysis),
        case_created=False,
    )


@router.post("", response_model=schemas.ReviewOut, status_code=201)
def create_review(
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_customer),
):
    """
    Publishes a customer review, runs Sentinel analysis, persists the
    results on the review, and automatically opens a CustomerCase +
    WorkflowLog entry when the analysis flags low rating / negative
    sentiment — matching the demo scenario in the README (CASE-1024).
    
    Uses optimized agent with 2000+ keywords for fast analysis.
    """
    product = db.get(models.Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    analysis = sentinel.analyze_review_v2(payload.review_text, payload.rating, product.title, product.category)

    review = models.Review(
        product_id=payload.product_id,
        user_id=current_user.id,
        rating=payload.rating,
        review_text=payload.review_text,
        status=models.ReviewStatus.PUBLISHED,
        sentiment=_sentiment_enum(analysis["sentiment"]),
        emotion=analysis["emotion"],
        severity=_severity_enum(analysis["severity"]),
        category=analysis["category"],
        root_cause=analysis["rootCause"],
        safety_concern=analysis["safetyConcern"],
        confidence=analysis["confidence"],
        missing_information=analysis["missingInformation"],
    )
    db.add(review)
    db.flush()  # get review.id before commit

    # Recompute product's aggregate rating
    all_ratings = [r.rating for r in product.reviews] + [payload.rating]
    product.rating = round(sum(all_ratings) / len(all_ratings), 2)

    case_created = False
    case_id = None

    if payload.rating <= CASE_TRIGGER_MAX_RATING or analysis["sentiment"] == "Negative":
        case = models.CustomerCase(
            review_id=review.id,
            product_id=product.id,
            customer_id=current_user.id,
            customer_name=current_user.name,
            product_name=product.title,
            severity=_severity_enum(analysis["severity"]),
            status=models.CaseStatus.OPEN,
            known_facts=[payload.review_text],
        )
        db.add(case)
        db.flush()

        db.add(
            models.WorkflowLog(
                case_id=case.id,
                agent="Product Sentinel",
                action="Analyzed review and opened case",
                decision=f"severity={analysis['severity']}, category={analysis['category']}",
                requires_approval=False,
            )
        )

        # Auto-draft an engineering issue for high severity / safety concerns
        if analysis["severity"] in ("High", "Critical") or analysis["safetyConcern"]:
            issue = models.EngineeringIssue(
                case_id=case.id,
                title=f"[{analysis['category']}] Issue reported for {product.title}",
                description_markdown=(
                    f"## Summary\n{payload.review_text}\n\n"
                    f"## Root cause (Sentinel hypothesis)\n{analysis['rootCause']}\n\n"
                    f"## Severity\n{analysis['severity']}\n\n"
                    f"## Safety concern\n{'Yes' if analysis['safetyConcern'] else 'No'}\n"
                ),
                severity=_severity_enum(analysis["severity"]),
                status=models.IssueStatus.PENDING_REVIEW,
            )
            db.add(issue)
            db.add(
                models.WorkflowLog(
                    case_id=case.id,
                    agent="Product Sentinel",
                    action="Drafted engineering issue",
                    decision="Awaiting developer approval",
                    requires_approval=True,
                )
            )

        case_created = True
        case_id = case.id

    db.commit()
    db.refresh(review)
    return review
