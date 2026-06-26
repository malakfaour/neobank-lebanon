from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.redis import blacklist_token, is_blacklisted
from app.core.config import settings
router = APIRouter()

# Temporary fake user — real DB user will replace this later
FAKE_USER = {"id": "user-1", "email": "test@neobank.com", "password": "secret123"}

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    access_token: str

@router.post("/login")
async def login(body: LoginRequest):
    if body.email != FAKE_USER["email"] or body.password != FAKE_USER["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token, _ = create_access_token(FAKE_USER["id"])
    refresh_token, _ = create_refresh_token(FAKE_USER["id"])
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh(body: RefreshRequest):
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")
    
    jti = payload.get("jti")
    if await is_blacklisted(jti):
        raise HTTPException(status_code=401, detail="Token already revoked")
    
    # Blacklist old refresh token
    await blacklist_token(jti, expire_minutes=settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60)
    
    # Issue new tokens
    access_token, _ = create_access_token(payload["sub"])
    refresh_token, _ = create_refresh_token(payload["sub"])
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(body: LogoutRequest):
    try:
        payload = decode_token(body.access_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await blacklist_token(payload["jti"])
    return {"message": "Logged out successfully"}