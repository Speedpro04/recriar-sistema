from celery import Celery
from .config import settings

celery_app = Celery(
    "clinicas_celery",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_URL,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
)
