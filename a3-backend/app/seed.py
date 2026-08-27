"""
Seeds the database with demo data equivalent to the frontend's
src/data/mockData.ts, so the pre-built UI flows (e.g. CASE-1024,
ISSUE-2025-1024) work identically against the real backend.

Run with: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app import models
from app.security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            print("Database already seeded, skipping.")
            return

        developer = models.User(
            id="USER-dev001",
            name="Jordan Diaz",
            email="developer@a3.demo",
            hashed_password=hash_password("password123"),
            role=models.Role.DEVELOPER,
        )
        customer = models.User(
            id="USER-cus001",
            name="Sam Rivera",
            email="customer@a3.demo",
            hashed_password=hash_password("password123"),
            role=models.Role.CUSTOMER,
        )
        db.add_all([developer, customer])
        db.flush()

        headphones = models.Product(
            id="PROD-1001",
            title="Smart Wireless Headphones",
            description="Noise-cancelling wireless headphones with 30-hour battery life and premium travel comfort.",
            price=129.99,
            category="Audio",
            rating=4.2,
            image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            status=models.ProductStatus.PUBLISHED,
        )
        speaker = models.Product(
            id="PROD-1002",
            title="Portable Bluetooth Speaker",
            description="Compact speaker with rich bass, IPX7 water resistance, and easy room-filling sound for daily use.",
            price=59.99,
            category="Audio",
            rating=4.6,
            image_url="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
            status=models.ProductStatus.PUBLISHED,
        )
        air_purifier = models.Product(
            id="PROD-1003",
            title="Air Purifier Pro",
            description="HEPA air purifier with quiet operation, auto mode, and a design made for bedrooms and small offices.",
            price=149.99,
            category="Home",
            rating=4.5,
            image_url="https://images.unsplash.com/photo-1581578731548-c64695cc6952",
            status=models.ProductStatus.PUBLISHED,
        )
        espresso = models.Product(
            id="PROD-1004",
            title="Portable Espresso Maker",
            description="Fast-heating espresso device for compact homes, small offices, and on-the-go routines.",
            price=119.99,
            category="Kitchen",
            rating=4.3,
            image_url="https://images.unsplash.com/photo-1511920170033-f8396924c348",
            status=models.ProductStatus.PUBLISHED,
        )
        db.add_all([headphones, speaker, air_purifier, espresso])
        db.flush()

        review = models.Review(
            id="REV-2001",
            product_id=headphones.id,
            user_id=customer.id,
            rating=2,
            review_text=(
                "Battery drains way faster than advertised and the earcups get "
                "noticeably warm after 20 minutes of use."
            ),
            status=models.ReviewStatus.PUBLISHED,
            sentiment=models.Sentiment.NEGATIVE,
            emotion="Frustrated",
            severity=models.Severity.HIGH,
            category="Battery / Charging",
            root_cause="This pattern often points to battery degradation or a charging-control fault that should be investigated.",
            safety_concern=True,
            confidence=0.82,
            missing_information=["Usage patterns", "Charging habits"],
        )
        review_2 = models.Review(
            id="REV-2002",
            product_id=air_purifier.id,
            user_id=customer.id,
            rating=5,
            review_text=(
                "The purifier is quiet enough for my bedroom and the air feels noticeably fresher after just one day. "
                "The auto mode and filter alerts are especially helpful for routine maintenance."
            ),
            status=models.ReviewStatus.PUBLISHED,
            sentiment=models.Sentiment.POSITIVE,
            emotion="Satisfied",
            severity=models.Severity.LOW,
            category="Indoor Air Quality",
            root_cause="Positive product experience with clear value and strong usability feedback.",
            safety_concern=False,
            confidence=0.91,
            missing_information=["Room size", "Filter replacement schedule"],
        )
        review_3 = models.Review(
            id="REV-2003",
            product_id=espresso.id,
            user_id=customer.id,
            rating=3,
            review_text=(
                "The espresso is compact and easy to use, but the machine needs a few extra minutes to stabilize before brewing and the steam wand is louder than expected."
            ),
            status=models.ReviewStatus.PUBLISHED,
            sentiment=models.Sentiment.NEUTRAL,
            emotion="Mixed",
            severity=models.Severity.MEDIUM,
            category="Kitchen / Heating",
            root_cause="The review suggests a warm-up delay and noise issue rather than a complete product failure.",
            safety_concern=False,
            confidence=0.76,
            missing_information=["Water temperature", "Usage frequency"],
        )
        db.add_all([review, review_2, review_3])
        db.flush()

        case = models.CustomerCase(
            id="CASE-1024",
            review_id=review.id,
            product_id=headphones.id,
            customer_id=customer.id,
            customer_name=customer.name,
            product_name=headphones.title,
            severity=models.Severity.HIGH,
            status=models.CaseStatus.OPEN,
            known_facts=[review.review_text],
        )
        db.add(case)
        db.flush()

        db.add(
            models.CaseMessage(
                case_id=case.id,
                sender="customer",
                text=review.review_text,
            )
        )
        db.add(
            models.CaseMessage(
                case_id=case.id,
                sender="agent",
                text=(
                    "Thanks for reporting this — I'm sorry the headphones have been "
                    "overheating. Could you tell me what percentage the battery is at "
                    "when you unplug it?"
                ),
            )
        )

        issue = models.EngineeringIssue(
            id="ISSUE-2025-1024",
            case_id=case.id,
            title="[Battery / Charging] Issue reported for Smart Wireless Headphones",
            description_markdown=(
                f"## Summary\n{review.review_text}\n\n"
                "## Root cause (Sentinel hypothesis)\n"
                "Possible battery degradation / charging controller issue\n\n"
                "## Severity\nHigh\n\n"
                "## Safety concern\nYes\n"
            ),
            severity=models.Severity.HIGH,
            status=models.IssueStatus.PENDING_REVIEW,
        )
        db.add(issue)

        db.add(
            models.WorkflowLog(
                case_id=case.id,
                agent="Product Sentinel",
                action="Analyzed review and opened case",
                decision="severity=High, category=Battery / Charging",
                requires_approval=False,
            )
        )
        db.add(
            models.WorkflowLog(
                case_id=case.id,
                agent="Product Sentinel",
                action="Drafted engineering issue",
                decision="Awaiting developer approval",
                requires_approval=True,
            )
        )

        db.commit()
        print("Seed complete.")
        print("  Developer login: developer@a3.demo / password123")
        print("  Customer login:  customer@a3.demo / password123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
