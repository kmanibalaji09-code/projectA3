# PROJECT A³ — Backend (FastAPI)

A production-ready FastAPI backend for the A³ customer-to-product intelligence platform, built to
be a drop-in replacement for the frontend's mock data and `MockAIService`. No frontend code needs
to change shape — only the fetch URLs (see "Connecting the frontend" below).

## Tech stack

- **FastAPI** + **Uvicorn**
- **SQLAlchemy 2.0** ORM over **SQLite** (swap `DATABASE_URL` for Postgres/MySQL later — no code
  changes needed since SQLAlchemy abstracts the dialect)
- **JWT auth** (`python-jose`) + **bcrypt** password hashing (`passlib`)
- **Pydantic v2** schemas for request/response validation

## Project structure

```
a3-backend/
  requirements.txt
  .env.example
  app/
    main.py            FastAPI app, CORS, router registration
    config.py           Settings loaded from .env
    database.py          SQLAlchemy engine/session
    models.py            ORM models (User, Product, Review, CustomerCase, CaseMessage,
                          EngineeringIssue, WorkflowLog)
    schemas.py            Pydantic request/response schemas
    security.py           Password hashing + JWT helpers
    deps.py               get_current_user / require_developer / require_customer
    seed.py               Seeds demo data equivalent to mockData.ts (CASE-1024, ISSUE-2025-1024)
    routers/
      auth.py              /api/auth/register, /api/auth/login, /api/auth/me
      products.py          /api/products (CRUD, publish/unpublish)
      reviews.py           /api/reviews, /api/reviews/analyze
      cases.py             /api/cases, live conversation with case memory
      issues.py            /api/issues (list/detail/edit)
      workflow.py          /api/workflow/approve, /api/workflow/logs
      analytics.py         /api/dashboard/analytics
    services/
      sentinel.py          Rule-based Sentinel/Resolution agent logic —
                            mirrors aiService.ts's MockAIService 1:1.
                            Swap point for the real CrewAI + Ollama agents.
```

## Setup

```bash
cd a3-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # edit SECRET_KEY etc. for production

# Creates tables + seeds demo data (CASE-1024, ISSUE-2025-1024, two demo users)
python -m app.seed

uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://127.0.0.1:8000`. Interactive docs: `http://127.0.0.1:8000/docs`.

### Demo accounts (created by `python -m app.seed`)

| Role      | Email                 | Password    |
|-----------|------------------------|-------------|
| Developer | developer@a3.demo      | password123 |
| Customer  | customer@a3.demo       | password123 |

## API reference

All endpoints are prefixed `/api`. Protected endpoints require `Authorization: Bearer <token>`
from `/api/auth/login`.

### Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | body: `{name, email, password, role}` |
| POST | `/api/auth/login` | public | body: `{email, password}` → `{access_token, user}` |
| GET | `/api/auth/me` | any authenticated | current user |

### Products
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/products` | any | customers only see `PUBLISHED`; developers can pass `?status=` |
| GET | `/api/products/{id}` | any | |
| POST | `/api/products` | developer | create (defaults to `DRAFT`) |
| PATCH | `/api/products/{id}` | developer | partial update |
| POST | `/api/products/{id}/publish` | developer | |
| POST | `/api/products/{id}/unpublish` | developer | |
| DELETE | `/api/products/{id}` | developer | |

### Reviews
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/reviews?product_id=` | any | |
| POST | `/api/reviews/analyze` | customer | dry-run Sentinel analysis, mirrors `AIService.analyzeReview`, does not persist |
| POST | `/api/reviews` | customer | persists review + analysis; **auto-opens a `CustomerCase`** (and drafts an `EngineeringIssue` for High/Critical severity or safety concerns) when rating ≤ 2 or sentiment is Negative |

### Cases
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/cases` | any | customers see only their own cases |
| GET | `/api/cases/{id}` | any (scoped) | includes full message history |
| POST | `/api/cases/{id}/messages` | any (scoped) | mirrors `AIService.generateCustomerResponse`; appends to case memory (`known_facts`) |
| PATCH | `/api/cases/{id}/status?status=` | developer | |

### Engineering Issues
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/issues?status=` | developer | |
| GET | `/api/issues/{id}` | developer | |
| PATCH | `/api/issues/{id}` | developer | edit title/description/severity |

### Workflow
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/workflow/logs?case_id=` | developer | agent decision audit trail |
| POST | `/api/workflow/approve` | developer | body: `{issue_id? , log_id?, decision: "approve"\|"reject", notes}` — powers the Issue detail page's Approve/Reject buttons |

### Analytics
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/dashboard/analytics` | developer | sentiment/severity/status distributions, review trend, avg resolution time |

## Connecting the frontend

The frontend's `src/services/aiService.ts` and `src/data/mockData.ts` are the two integration
points called out in the frontend README. To connect:

1. **Auth**: add a login call to `/api/auth/login`, store `access_token` (e.g. in the existing
   `AppContext`), and attach it as `Authorization: Bearer <token>` on every request.
2. **Data fetching**: replace the mock functions in `mockData.ts` with `fetch` calls to the
   endpoints above (base URL `http://localhost:8000`).
3. **AI service**: replace `MockAIService` in `aiService.ts` with an implementation whose two
   methods call `POST /api/reviews/analyze` and `POST /api/cases/{id}/messages` respectively —
   the response shapes match `SentinelAnalysis` and `{ response, updatedMemory }` field-for-field
   (`known_facts` ⇄ `updatedMemory.knownFacts`).
4. Nothing in `components/` or `pages/` needs to change, per the frontend README's own design.

## CORS

`app/main.py` reads allowed origins from `CORS_ORIGINS` in `.env` (defaults to
`http://localhost:5173,http://127.0.0.1:5173`, matching Vite's default dev port), so the two
projects talk to each other out of the box in local development.

## Swapping in the real AI agents later

`app/services/sentinel.py` currently implements rule-based logic equivalent to `MockAIService`.
To wire in the real Product Sentinel / Customer Resolution agents (CrewAI + Ollama):

1. Add a new module, e.g. `app/services/ollama_sentinel.py`, implementing the same two functions
   (`analyze_review`, `generate_customer_response`) but calling out to CrewAI/Ollama.
2. Swap the import in `app/routers/reviews.py` and `app/routers/cases.py`.
3. No schema, route, or frontend changes required — the interface stays identical, mirroring the
   "no changes to any page or component required" promise from the frontend README.

## Production notes

- Set a strong, random `SECRET_KEY` in `.env` before deploying.
- Swap `DATABASE_URL` to Postgres for production (e.g.
  `postgresql+psycopg://user:pass@host/db`) — install `psycopg[binary]` and no other code changes
  are needed since the app only uses SQLAlchemy's dialect-agnostic API.
- Consider Alembic for schema migrations once the schema stabilizes (`Base.metadata.create_all`
  is fine for development but doesn't handle migrations).
- Restrict `CORS_ORIGINS` to your real frontend domain(s).
