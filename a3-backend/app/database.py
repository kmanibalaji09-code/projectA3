from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine_options = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite") and "tmp" in settings.database_url:
    engine_options["poolclass"] = NullPool

engine = create_engine(settings.database_url, connect_args=connect_args, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
