from datetime import datetime, timedelta, timezone
from uuid import uuid4
from jose import jwt
from app.core.config import settings

def create_access_token(subject: str) -> tuple[str, str]:
    jti = str(uuid4())
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "jti": jti,
        "exp": expire,
        "type": "access"
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM), jti

def create_refresh_token(subject: str) -> tuple[str, str]:
    jti = str(uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    payload = {
        "sub": subject,
        "jti": jti,
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM), jti

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])