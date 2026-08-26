from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_developer
from app import models, schemas

router = APIRouter(prefix="/api/issues", tags=["issues"])


@router.get("", response_model=list[schemas.IssueOut])
def list_issues(
    status: models.IssueStatus | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    query = db.query(models.EngineeringIssue)
    if status is not None:
        query = query.filter(models.EngineeringIssue.status == status)
    return query.order_by(models.EngineeringIssue.created_at.desc()).all()


@router.get("/{issue_id}", response_model=schemas.IssueOut)
def get_issue(issue_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_developer)):
    issue = db.get(models.EngineeringIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.patch("/{issue_id}", response_model=schemas.IssueOut)
def edit_issue(
    issue_id: str,
    payload: schemas.IssueUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    issue = db.get(models.EngineeringIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(issue, field, value)

    db.add(
        models.WorkflowLog(
            case_id=issue.case_id,
            agent="Developer",
            action="Edited engineering issue",
            decision="Manual edit before approval",
            requires_approval=False,
            approved_by=current_user.id,
        )
    )

    db.commit()
    db.refresh(issue)
    return issue
