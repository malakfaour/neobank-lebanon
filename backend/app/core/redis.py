import redis.asyncio as aioredis
from app.core.config import settings

redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)

async def blacklist_token(jti: str, expire_minutes: int = None) -> None:
    ttl = (expire_minutes or settings.JWT_EXPIRE_MINUTES) * 60
    await redis_client.setex(f"blacklist:{jti}", ttl, "1")

async def is_blacklisted(jti: str) -> bool:
    result = await redis_client.get(f"blacklist:{jti}")
    return result is not None