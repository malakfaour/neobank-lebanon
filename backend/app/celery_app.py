from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "neobank",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.imports = (
    "app.tasks.exchange_tasks",
)

celery_app.conf.beat_schedule = {
    "poll-exchange-rates-every-5-minutes": {
        "task": "app.tasks.exchange_tasks.poll_exchange_rates",
        "schedule": 300.0,
    },
}

celery_app.conf.timezone = "Asia/Beirut"