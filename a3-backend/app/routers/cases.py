from fastapi import APIRouter, Depends, HTTPException
import re
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


def _case_output(case: models.CustomerCase) -> dict:
    latest_agent_message = next(
        (message.text for message in reversed(case.messages) if message.sender == "agent"),
        None,
    )
    return {
        "id": case.id,
        "customer_name": case.customer_name,
        "product_name": case.product_name,
        "product_id": case.product_id,
        "review_id": case.review_id,
        "severity": case.severity,
        "status": case.status,
        "known_facts": case.known_facts,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "agent_feedback": latest_agent_message,
    }


def _case_detail_output(case: models.CustomerCase) -> dict:
    output = _case_output(case)
    review = case.review
    analysis = None
    if review:
        analysis = {
            "sentiment": review.sentiment,
            "emotion": review.emotion or "",
            "severity": review.severity or case.severity,
            "category": review.category or "General",
            "rootCause": review.root_cause or "Requires further diagnosis",
            "customerProblem": review.review_text,
            "safetyConcern": review.safety_concern,
            "confidence": review.confidence or 0,
            "missingInformation": review.missing_information or [],
        }
    return {
        **output,
        "messages": case.messages,
        "analysis": analysis,
        "original_review_text": review.review_text if review else "",
        "original_rating": review.rating if review else 0,
        "engineering_issue": case.issue,
    }


def _create_diagnostic_issue(case: models.CustomerCase, db: Session) -> models.EngineeringIssue:
    facts = " ".join(case.known_facts or [])
    is_connectivity = bool(re.search(r"connect|disconnect|bluetooth|pair|wifi|signal", facts, re.IGNORECASE))
    is_audio = bool(re.search(r"sound|audio|volume|noise|microphone|call", facts, re.IGNORECASE))
    is_display = bool(re.search(r"screen|display|bright|brightness|pixel|touch", facts, re.IGNORECASE))
    is_gps = bool(re.search(r"gps|location|map|navigation", facts, re.IGNORECASE))
    is_accessory = bool(re.search(r"cable|wire|port|plug", facts, re.IGNORECASE))
    if is_connectivity:
        title = f"Connectivity instability in {case.product_name}"
        root_cause = "Possible Bluetooth pairing, firmware compatibility, or signal stability fault"
        investigation = "Check connection logs across supported devices, reproduce during calls and music playback, and verify firmware compatibility."
        solution = "Clear pairing state, test the latest firmware, improve reconnection handling, and validate stability across supported phones and laptops."
    elif is_audio:
        title = f"Audio or call quality issue in {case.product_name}"
        root_cause = "Possible audio processing, speaker, or microphone component fault"
        investigation = "Compare playback and call behavior across apps and devices, checking permissions, volume handling, and firmware."
        solution = "Isolate the failing audio path, correct processing or firmware behavior, and add playback and call regression tests."
    elif is_display:
        title = f"Display or touch issue in {case.product_name}"
        root_cause = "Possible display calibration, panel, or touch-sensor fault"
        investigation = "Reproduce across brightness settings, inspect recent software changes, and test the affected panel or touch sensor."
        solution = "Correct display calibration or replace the failing panel/sensor, then verify brightness and touch regression coverage."
    elif is_gps:
        title = f"GPS and location instability in {case.product_name}"
        root_cause = "Possible GPS reacquisition, permissions, or location-signal fault"
        investigation = "Compare signal behavior across locations, permissions, firmware, and map applications."
        solution = "Improve signal reacquisition and permissions handling, then validate location accuracy across supported environments."
    elif is_accessory:
        title = f"Accessory or port quality issue in {case.product_name}"
        root_cause = "Possible cable, connector, or port quality fault"
        investigation = "Test known-good accessories, inspect the port, and compare failures across production batches."
        solution = "Correct the connector or accessory defect, strengthen quality checks, and add compatibility tests."
    else:
        title = f"Product issue requiring investigation: {case.product_name}"
        root_cause = "Issue is reproducible under the customer conditions and requires component-level diagnosis"
        investigation = "Reproduce the reported behavior using the customer conditions and compare it with the product specification."
        solution = "Identify the failing component, add a regression test for the reported conditions, and ship a verified corrective update."
    issue = models.EngineeringIssue(
        case_id=case.id,
        title=title,
        description_markdown=(
            f"## Summary\n{facts}\n\n## Probable root cause\n{root_cause}\n\n"
            f"## Evidence\nCustomer provided {len(case.known_facts or [])} diagnostic details.\n\n"
            f"## Investigation\n{investigation}\n\n## Proposed solution\n{solution}\n"
        ),
        severity=case.severity,
        status=models.IssueStatus.PENDING_REVIEW,
    )
    db.add(issue)
    db.add(models.WorkflowLog(
        case_id=case.id,
        agent="Product Innovation Architect",
        action="Created diagnostic engineering issue",
        decision="Awaiting developer review",
        requires_approval=True,
    ))
    db.flush()
    return issue


@router.get("", response_model=list[schemas.CaseOut])
def list_cases(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = _scope_query(db.query(models.CustomerCase), current_user)
    return [_case_output(case) for case in query.order_by(models.CustomerCase.created_at.desc()).all()]


@router.get("/{case_id}", response_model=schemas.CaseDetailOut)
def get_case(case_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    case = db.get(models.CustomerCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if current_user.role == models.Role.CUSTOMER and case.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    return _case_detail_output(case)


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

    # Once the customer has supplied the original review plus four diagnostic
    # details, create the developer-facing engineering issue automatically.
    if len(case.known_facts) >= 5 and case.issue is None:
        _create_diagnostic_issue(case, db)

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
