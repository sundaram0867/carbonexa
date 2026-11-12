"""Application settings, loaded from environment variables / .env file."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    api_prefix: str = "/api/v1"

    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "carbonexa"
    db_password: str = ""
    db_name: str = "carbonexa"
    # Optional full URL override (used by tests). Leave empty for MySQL.
    database_url: str = ""

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    jwt_secret: str = ""

    @property
    def sqlalchemy_url(self) -> URL | str:
        if self.database_url:
            return self.database_url
        # URL.create escapes special characters in the password safely.
        return URL.create(
            "mysql+pymysql",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
            query={"charset": "utf8mb4"},
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
