from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py → 3 üst dizin = proje kökü (klinik-ai/)
_ROOT_ENV = Path(__file__).parent.parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT_ENV),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase PostgreSQL — SQLAlchemy bağlantısı
    database_url: str = "postgresql://postgres:password@localhost:5432/postgres"

    # Supabase REST API — pgvector vector store
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama3-8b-8192"

    # App
    admin_token: str = "changeme"
    jwt_secret: str = "klinik-ai-secret-change-in-production"


settings = Settings()
