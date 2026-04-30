from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings

_security = HTTPBearer(auto_error=False)


def verify_admin(credentials: HTTPAuthorizationCredentials | None = Depends(_security)) -> str:
    if not credentials or credentials.credentials != settings.admin_token:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim")
    return credentials.credentials
