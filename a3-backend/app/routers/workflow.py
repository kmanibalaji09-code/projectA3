from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_developer
from app import models, schemas

router = APIRouter(prefix="/api/workflow", tags=["workflow"])


@router.get("/logs", response_model=list[schemas.WorkflowLogOut])
def list_workflow_logs(
    case_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    query = db.query(models.WorkflowLog)
    if case_id:
        query = query.filter(models.WorkflowLog.case_id == case_id)
    return query.order_by(models.WorkflowLog.created_at.desc()).all()


@router.post("/approve")
def approve_workflow_item(
    payload: schemas.WorkflowApproveRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    """
    Handles human-in-the-loop approvals. Supports approving/rejecting either
    a pending WorkflowLog entry (requires_approval=True) or an
    EngineeringIssue directly (from the Issue detail page's Approve/Reject
    buttons).
    """
    if payload.decision not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="decision must be 'approve' or 'reject'")

    updated_log = None
    updated_issue = None

    if payload.log_id:
        log = db.get(models.WorkflowLog, payload.log_id)
        if not log:
            raise HTTPException(status_code=404, detail="Workflow log not found")
        log.decision = f"{payload.decision.upper()}: {payload.notes}".strip(": ")
        log.approved_by = current_user.id
        updated_log = log

    if payload.issue_id:
        issue = db.get(models.EngineeringIssue, payload.issue_id)
        if not issue:
            raise HTTPException(status_code=404, detail="Engineering issue not found")
        issue.status = models.IssueStatus.APPROVED if payload.decision == "approve" else models.IssueStatus.REJECTED
        if payload.decision == "approve":
            issue.resolved_at = datetime.utcnow()
        updated_issue = issue

        db.add(
            models.WorkflowLog(
                case_id=issue.case_id,
                agent="Developer",
                action=f"{payload.decision.capitalize()}d engineering issue",
                decision=payload.notes,
                requires_approval=False,
                approved_by=current_user.id,
            )
        )

    if not payload.log_id and not payload.issue_id:
        raise HTTPException(status_code=400, detail="Provide either log_id or issue_id")

    db.commit()

    return {
        "log": schemas.WorkflowLogOut.model_validate(updated_log) if updated_log else None,
        "issue": schemas.IssueOut.model_validate(updated_issue) if updated_issue else None,
    }
