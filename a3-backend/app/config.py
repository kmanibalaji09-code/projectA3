from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = "change-this-to-a-long-random-string-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite:///./a3.db"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    ai_provider: str = "mock"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
