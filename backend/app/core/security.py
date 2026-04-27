from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import bcrypt as _bcrypt_mod
# passlib 1.7.4 + bcrypt 4.x uyumsuzluğu: bcrypt 4.0'dan itibaren __about__ kaldırıldı
if not hasattr(_bcrypt_mod, "__about__"):
    _bcrypt_mod.__about__ = SimpleNamespace(__version__=_bcrypt_mod.__version__)

import jwt
from passlib.context import CryptContext

from app.core.config import settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(patient_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(patient_id), "exp": expire},
        settings.jwt_secret,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> int:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    return int(payload["sub"])
