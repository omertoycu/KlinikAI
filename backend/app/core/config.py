from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT_ENV = Path(__file__).parent.parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT_ENV),
        env_file_encoding="utf-8-sig",
        extra="ignore",
    )

    # Neon PostgreSQL (veya local SQLite: sqlite:///./klinik.db)
    database_url: str = "postgresql://user:password@localhost:5432/neondb?sslmode=require"

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama3-8b-8192"

    # App
    admin_token: str = "changeme"
    jwt_secret: str = "klinik-ai-secret-change-in-production"
    app_url: str = ""  # ör. https://myklinik.com — SMS iptal linkinde kullanılır

    # SMS — Netgsm
    netgsm_usercode: str = ""
    netgsm_password: str = ""
    netgsm_header: str = "KlinikAI"

    # Email — SMTP (Gmail: smtp.gmail.com:587, app password kullan)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True


settings = Settings()
