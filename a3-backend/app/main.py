from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.config import settings
from app.routers import auth, products, reviews, cases, issues, analytics, workflow

# Creates tables on startup if they don't exist. For the seeded demo data,
# run `python -m app.seed` once after this.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PROJECT A³ API",
    description="Customer-to-Product Intelligence Platform backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(reviews.router)
app.include_router(cases.router)
app.include_router(issues.router)
app.include_router(analytics.router)
app.include_router(workflow.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def api_root():
    return {"name": "PROJECT A3 API", "status": "ok", "docs": "/docs"}
