from fastapi import HTTPException, Request, status
from app.core.redis import redis_client


async def check_rate_limit(
    request: Request,
    key_prefix: str,
    max_requests: int,
    window_seconds: int,
) -> None:
    """
    Per-endpoint Redis counter rate limiter.
    Raises 429 with Retry-After header if limit exceeded.
    """
    client_ip = request.client.host
    key = f"rate:{key_prefix}:{client_ip}"

    count = await redis_client.incr(key)

    if count == 1:
        # First request — set expiry window
        await redis_client.expire(key, window_seconds)

    if count > max_requests:
        ttl = await redis_client.ttl(key)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Try again in {ttl} seconds.",
            headers={"Retry-After": str(ttl)},
        )