import random
from app.core.redis import redis_client
from app.core.config import settings


def _otp_key(user_id: str) -> str:
    return f"otp:{user_id}"


async def generate_and_store_otp(user_id: str) -> str:
    """
    Generates a 6-digit OTP, stores it in Redis with TTL.
    Week 1: prints to console. Week 2: replaced by Twilio SMS.
    """
    otp = f"{random.randint(0, 999999):06d}"
    ttl = settings.OTP_EXPIRE_MINUTES * 60
    await redis_client.setex(_otp_key(user_id), ttl, otp)
    print(f"[DEV ONLY] OTP for user {user_id}: {otp}", flush=True)
    return otp


async def verify_and_consume_otp(user_id: str, code: str) -> bool:
    """
    Validates the OTP for the given user.
    Deletes it immediately after a successful match (single use).
    Returns True if valid, False otherwise.
    """
    key = _otp_key(user_id)
    stored = await redis_client.get(key)

    if stored is None:
        return False  # Expired or never issued

    if stored != code:
        return False  # Wrong code

    await redis_client.delete(key)  # Consume — single use only
    return True
