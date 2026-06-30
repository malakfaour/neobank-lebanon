from app.celery_app import celery_app

@celery_app.task(name="app.tasks.transaction_tasks.ping")
def ping():
    return "pong"