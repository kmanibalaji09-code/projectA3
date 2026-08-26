from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import Role, ProductStatus, ReviewStatus, Sentiment, Severity, CaseStatus, IssueStatus


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    role: Role


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Products ----------

class ProductCreate(BaseModel):
    title: str
    description: str = ""
    price: float = 0.0
    category: str = "General"
    image_url: str = ""
    status: ProductStatus = ProductStatus.DRAFT


class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    category: str | None = None
    image_url: str | None = None
    status: ProductStatus | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    price: float
    category: str
    rating: float
    image_url: str
    status: ProductStatus
    created_at: datetime


# ---------- Reviews / Sentinel ----------

class SentinelAnalysisOut(BaseModel):
    sentiment: Sentiment
    emotion: str
    severity: Severity
    category: str
    rootCause: str
    customerProblem: str
    safetyConcern: bool
    confidence: float
    missingInformation: list[str]


class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    review_text: str


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    user_id: str
    rating: int
    review_text: str
    status: ReviewStatus
    sentiment: Sentiment | None
    emotion: str | None
    severity: Severity | None
    category: str | None
    root_cause: str | None
    safety_concern: bool
    confidence: float | None
    missing_information: list[str] | None
    created_at: datetime


class ReviewAnalyzeRequest(BaseModel):
    review_text: str
    rating: int
    product_id: str


class ReviewAnalyzeResponse(BaseModel):
    analysis: SentinelAnalysisOut
    case_created: bool
    case_id: str | None = None


# ---------- Cases ----------

class CaseMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    sender: str
    text: str
    created_at: datetime


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    customer_name: str
    product_name: str
    product_id: str
    review_id: str | None
    severity: Severity
    status: CaseStatus
    known_facts: list[str] | None
    created_at: datetime
    updated_at: datetime
    agent_feedback: str | None = None


class CaseDetailOut(CaseOut):
    messages: list[CaseMessageOut] = []
    analysis: SentinelAnalysisOut | None = None
    original_review_text: str = ""
    original_rating: int = 0
    engineering_issue: "IssueOut | None" = None


class CaseMessageCreate(BaseModel):
    message: str


class CaseMessageResponse(BaseModel):
    response: str
    known_facts: list[str]


# ---------- Engineering Issues ----------

class IssueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str
    title: str
    description_markdown: str
    severity: Severity
    status: IssueStatus
    created_at: datetime
    resolved_at: datetime | None


class IssueUpdate(BaseModel):
    title: str | None = None
    description_markdown: str | None = None
    severity: Severity | None = None


# ---------- Workflow ----------

class WorkflowApproveRequest(BaseModel):
    log_id: str | None = None
    issue_id: str | None = None
    decision: str  # "approve" | "reject"
    notes: str = ""


class WorkflowLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    case_id: str | None
    agent: str
    action: str
    decision: str
    requires_approval: bool
    created_at: datetime


# ---------- Analytics ----------

class AnalyticsOut(BaseModel):
    total_products: int
    total_reviews: int
    total_cases: int
    open_cases: int
    sentiment_distribution: dict[str, int]
    severity_distribution: dict[str, int]
    case_status_distribution: dict[str, int]
    review_trend: list[dict]
    avg_resolution_hours: float | None
