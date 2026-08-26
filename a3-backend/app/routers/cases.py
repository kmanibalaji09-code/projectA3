from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_developer
from app import models, schemas
from app.services import sentinel

router = APIRouter(prefix="/api/cases", tags=["cases"])


def _scope_query(query, current_user: models.User):
    if current_user.role == models.Role.CUSTOMER:
        return query.filter(models.CustomerCase.customer_id == current_user.id)
    return query


@router.get("", response_model=list[schemas.CaseOut])
def list_cases(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = _scope_query(db.query(models.CustomerCase), current_user)
    return query.order_by(models.CustomerCase.created_at.desc()).all()


@router.get("/{case_id}", response_model=schemas.CaseDetailOut)
def get_case(case_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    case = db.get(models.CustomerCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == models.Role.CUSTOMER and case.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    return case


@router.post("/{case_id}/messages", response_model=schemas.CaseMessageResponse)
def send_case_message(
    case_id: str,
    payload: schemas.CaseMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Mirrors AIService.generateCustomerResponse(message, memory). Appends the
    customer's message, runs the Customer Resolution Agent (mocked), appends
    its reply, and persists the updated case memory (known_facts).
    """
    case = db.get(models.CustomerCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == models.Role.CUSTOMER and case.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to message this case")

    db.add(models.CaseMessage(case_id=case.id, sender="customer", text=payload.message))

    result = sentinel.generate_customer_response(payload.message, case.known_facts or [])

    db.add(models.CaseMessage(case_id=case.id, sender="agent", text=result["response"]))
    case.known_facts = result["known_facts"]

    db.add(
        models.WorkflowLog(
            case_id=case.id,
            agent="Customer Resolution Agent",
            action="Generated response",
            decision="Requested additional diagnostic detail",
            requires_approval=False,
        )
    )

    db.commit()

    return schemas.CaseMessageResponse(response=result["response"], known_facts=case.known_facts)


@router.patch("/{case_id}/status", response_model=schemas.CaseOut)
def update_case_status(
    case_id: str,
    status: models.CaseStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_developer),
):
    case = db.get(models.CustomerCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.status = status
    db.commit()
    db.refresh(case)
    return case
