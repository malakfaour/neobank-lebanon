import logging

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.transaction_tasks.ping")
def ping():
    return "pong"


@celery_app.task(name="app.tasks.transaction_tasks.score_transaction")
def score_transaction(transaction_id):
    """
    DEVATTECH-36 stub.

    No real fraud detection logic yet — full scoring model (XGBoost /
    Isolation Forest / rule-based fallback) lands in Sprint 3
    (DEVATTECH-75). This stub only logs receipt and returns a fixed
    non-flagged score so downstream wiring (transaction status updates,
    audit logging) can be built against a stable contract now.
    """
    logger.info("Transaction %s received for fraud scoring", transaction_id)

    return {"score": 0.0, "flagged": False}
