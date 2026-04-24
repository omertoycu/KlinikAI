import logging
import socket
from urllib.parse import unquote, urlparse

import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = logging.getLogger(__name__)


def _make_connection():
    """
    Build a psycopg2 connection directly, passing hostaddr as a kwarg so
    psycopg2's C-level DNS is bypassed entirely (it would otherwise pick IPv6).
    """
    parsed = urlparse(settings.database_url)
    hostname = parsed.hostname

    ipv4 = None
    try:
        results = socket.getaddrinfo(hostname, None, socket.AF_INET)
        if results:
            ipv4 = results[0][4][0]
    except Exception as exc:
        logger.warning("IPv4 resolution failed for %s: %s", hostname, exc)

    if ipv4:
        logger.info("DB: connecting to %s via IPv4 %s", hostname, ipv4)
    else:
        logger.warning("DB: no IPv4 found for %s — hostname fallback (may get IPv6)", hostname)

    kwargs = {
        "host": hostname,
        "port": parsed.port or 5432,
        "user": parsed.username,
        "password": unquote(parsed.password or ""),
        "dbname": (parsed.path or "").lstrip("/") or "postgres",
        "connect_timeout": 10,
    }
    if ipv4:
        kwargs["hostaddr"] = ipv4

    return psycopg2.connect(**kwargs)


engine = create_engine(
    "postgresql+psycopg2://",
    creator=_make_connection,
    poolclass=NullPool,
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
