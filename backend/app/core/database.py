import logging
import socket
import time
from urllib.parse import unquote, urlparse

import psycopg2
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import QueuePool

from app.core.config import settings

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3
_RETRY_DELAY = 0.5  # saniye


def _build_connect_kwargs() -> dict:
    parsed = urlparse(settings.database_url)
    hostname = parsed.hostname

    # IPv4 çözümlemeyi dene; başarısız olursa hostname ile devam et
    ipv4 = None
    try:
        results = socket.getaddrinfo(hostname, None, socket.AF_INET)
        if results:
            ipv4 = results[0][4][0]
    except Exception:
        pass

    kwargs = {
        "host": hostname,
        "port": parsed.port or 5432,
        "user": parsed.username,
        "password": unquote(parsed.password or ""),
        "dbname": (parsed.path or "").lstrip("/") or "postgres",
        "connect_timeout": 15,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 5,
        "keepalives_count": 3,
    }
    if ipv4:
        kwargs["hostaddr"] = ipv4

    return kwargs


def _make_connection():
    kwargs = _build_connect_kwargs()
    last_exc = None
    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            return psycopg2.connect(**kwargs)
        except psycopg2.OperationalError as exc:
            last_exc = exc
            if attempt < _MAX_RETRIES:
                logger.warning("DB bağlantısı başarısız (deneme %d/%d): %s", attempt, _MAX_RETRIES, exc)
                time.sleep(_RETRY_DELAY * attempt)
    raise last_exc


engine = create_engine(
    "postgresql+psycopg2://",
    creator=_make_connection,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,       # kullanılmadan önce bağlantıyı test et
    pool_recycle=300,         # 5 dakikada bir bağlantıları yenile
    pool_timeout=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
