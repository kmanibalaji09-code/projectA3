import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


class Role(str, enum.Enum):
    DEVELOPER = "DEVELOPER"
    CUSTOMER = "CUSTOMER"


class ProductStatus(str, enum.Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"


class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    PUBLISHED = "PUBLISHED"
    FLAGGED = "FLAGGED"


class Sentiment(str, enum.Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"


class Severity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CaseStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class IssueStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("USER"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[Role] = mapped_column(SAEnum(Role), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reviews: Mapped[list["Review"]] = relationship(back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("PROD"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[float] = mapped_column(Float, default=0.0)
    category: Mapped[str] = mapped_column(String, default="General")
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    image_url: Mapped[str] = mapped_column(String, default="")
    status: Mapped[ProductStatus] = mapped_column(SAEnum(ProductStatus), default=ProductStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reviews: Mapped[list["Review"]] = relationship(back_populates="product")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("REV"))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    review_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ReviewStatus] = mapped_column(SAEnum(ReviewStatus), default=ReviewStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # --- Sentinel analysis (flattened SentinelAnalysis from aiService.ts) ---
    sentiment: Mapped[Sentiment | None] = mapped_column(SAEnum(Sentiment), nullable=True)
    emotion: Mapped[str | None] = mapped_column(String, nullable=True)
    severity: Mapped[Severity | None] = mapped_column(SAEnum(Severity), nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    root_cause: Mapped[str | None] = mapped_column(String, nullable=True)
    safety_concern: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    missing_information: Mapped[list | None] = mapped_column(JSON, nullable=True)

    product: Mapped["Product"] = relationship(back_populates="reviews")
    user: Mapped["User"] = relationship(back_populates="reviews")
    case: Mapped["CustomerCase | None"] = relationship(back_populates="review", uselist=False)


class CustomerCase(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("CASE"))
    review_id: Mapped[str | None] = mapped_column(ForeignKey("reviews.id"), nullable=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), nullable=False)
    customer_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    customer_name: Mapped[str] = mapped_column(String, nullable=False)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[Severity] = mapped_column(SAEnum(Severity), default=Severity.MEDIUM)
    status: Mapped[CaseStatus] = mapped_column(SAEnum(CaseStatus), default=CaseStatus.OPEN)

    # CaseMemory.knownFacts from aiService.ts, persisted as JSON array of strings
    known_facts: Mapped[list | None] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    review: Mapped["Review | None"] = relationship(back_populates="case")
    messages: Mapped[list["CaseMessage"]] = relationship(back_populates="case", cascade="all, delete-orphan")
    issue: Mapped["EngineeringIssue | None"] = relationship(back_populates="case", uselist=False)
    workflow_logs: Mapped[list["WorkflowLog"]] = relationship(back_populates="case", cascade="all, delete-orphan")


class CaseMessage(Base):
    __tablename__ = "case_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("MSG"))
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), nullable=False)
    sender: Mapped[str] = mapped_column(String, nullable=False)  # "customer" | "agent"
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    case: Mapped["CustomerCase"] = relationship(back_populates="messages")


class EngineeringIssue(Base):
    __tablename__ = "issues"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("ISSUE"))
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description_markdown: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[Severity] = mapped_column(SAEnum(Severity), default=Severity.MEDIUM)
    status: Mapped[IssueStatus] = mapped_column(SAEnum(IssueStatus), default=IssueStatus.PENDING_REVIEW)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    case: Mapped["CustomerCase"] = relationship(back_populates="issue")


class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: gen_id("LOG"))
    case_id: Mapped[str | None] = mapped_column(ForeignKey("cases.id"), nullable=True)
    agent: Mapped[str] = mapped_column(String, nullable=False)  # e.g. "Product Sentinel", "Customer Resolution Agent"
    action: Mapped[str] = mapped_column(String, nullable=False)
    decision: Mapped[str] = mapped_column(String, default="")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    case: Mapped["CustomerCase | None"] = relationship(back_populates="workflow_logs")
