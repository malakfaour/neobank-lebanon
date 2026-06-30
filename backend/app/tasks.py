from app.celery import celery_app

@celery_app.task
def ping():
    return "pong"