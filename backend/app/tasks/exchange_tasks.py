import json
from decimal import Decimal

import redis

from app.celery_app import celery_app
from app.core.config import settings
from app.services.exchange_cache import EXCHANGE_RATES_CACHE_KEY


STUB_RATES = {
    ("USD", "LBP"): Decimal("89500"),
    ("EUR", "USD"): Decimal("1.08"),
    ("USD", "EUR"): Decimal("0.92"),
}


def decimal_to_str_rates(rates: dict[tuple[str, str], Decimal]) -> dict[str, str]:
    return {f"{base}:{target}": str(rate) for (base, target), rate in rates.items()}


@celery_app.task(name="app.tasks.exchange_tasks.poll_exchange_rates")
def poll_exchange_rates():
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

    redis_client.setex(
        EXCHANGE_RATES_CACHE_KEY,
        300,
        json.dumps(decimal_to_str_rates(STUB_RATES)),
    )

    return {
        "status": "ok",
        "message": "Exchange rates cache refreshed",
        "rates_count": len(STUB_RATES),
    }