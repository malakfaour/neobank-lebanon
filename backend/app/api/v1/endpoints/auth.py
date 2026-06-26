import logging
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.redis import blacklist_token, is_blacklisted
from app.core.config import settings
from app.api.dependencies import get_current_user
from app.schemas.user import CurrentUser
from app.services.otp import generate_and_store_otp, verify_and_consume_otp

logger = logging.getLogger(__name__)
router = APIRouter()

# Temporary fake user — replaced by DB in future tickets
FAKE_USER = {"id": "user-1", "email": "test@neobank.com", "password": "secret123"}


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    access_token: str


class SendOTPRequest(BaseModel):
    user_id: str


class VerifyOTPRequest(BaseModel):
    user_id: str
    code: str


@router.post("/login", summary="Login with email and password")
async def login(body: LoginRequest):
    if body.email != FAKE_USER["email"] or body.password != FAKE_USER["password"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    access_token, _ = create_access_token(FAKE_USER["id"])
    refresh_token, _ = create_refresh_token(FAKE_USER["id"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", summary="Rotate refresh token")
async def refresh(body: RefreshRequest):
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a refresh token"
        )
    jti = payload.get("jti")
    if await is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token already revoked"
        )
    await blacklist_token(jti, expire_minutes=settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60)
    access_token, _ = create_access_token(payload["sub"])
    refresh_token, _ = create_refresh_token(payload["sub"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout", summary="Logout and blacklist token")
async def logout(body: LogoutRequest):
    try:
        payload = decode_token(body.access_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    await blacklist_token(payload["jti"])
    return {"message": "Logged out successfully"}


@router.post("/send-otp", summary="Generate and send OTP to user")
async def send_otp(
    body: SendOTPRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Generates a 6-digit OTP stored in Redis for 5 minutes. Week 1: logs to console."""
    await generate_and_store_otp(body.user_id)
    return {"message": f"OTP sent to user {body.user_id}"}


@router.post("/verify-otp", summary="Verify OTP code")
async def verify_otp(
    body: VerifyOTPRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Validates OTP and deletes it on success (single use)."""
    valid = await verify_and_consume_otp(body.user_id, body.code)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    return {"message": "OTP verified successfully"}