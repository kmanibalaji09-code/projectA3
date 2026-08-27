from pydantic_settings import BaseSettings, SettingsConfigDict
import os
import tempfile


class Settings(BaseSettings):
    secret_key: str = "change-this-to-a-long-random-string-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite:///./a3.db"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    ai_provider: str = "mock"
    ollama_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.1:8b"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

# Vercel functions cannot persist files in the deployment directory. Keep a
# temporary SQLite fallback for smoke testing; production should use Postgres.
if os.getenv("VERCEL") and settings.database_url.startswith("sqlite:///./"):
    settings.database_url = f"sqlite:///{tempfile.gettempdir()}/a3.db"

if settings.database_url.startswith(("postgres://", "postgresql://")) and "+psycopg" not in settings.database_url:
    settings.database_url = settings.database_url.replace("postgres://", "postgresql+psycopg://", 1)
    settings.database_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
