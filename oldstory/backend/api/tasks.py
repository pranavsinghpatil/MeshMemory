"""Celery tasks for asynchronous processing (OCR, etc.).
This file defines a minimal Celery application instance named `celery_app`
so that other modules can import tasks without creating duplicate Celery apps.

Real deployments should configure the broker & backend via environment
variables CELERY_BROKER_URL and CELERY_RESULT_BACKEND. For local/dev tests we
use the in-memory backend so that `.apply_async().get()` works immediately.
"""
from __future__ import annotations
import os
from celery import Celery
import pytesseract
import io
from PIL import Image
from typing import List

# Broker / backend – default to in-memory for test environments
broker_url = os.getenv("CELERY_BROKER_URL", "memory://localhost/")
backend_url = os.getenv("CELERY_RESULT_BACKEND", "rpc://")

celery_app = Celery(
    "MeshMemory_backend",
    broker=broker_url,
    backend=backend_url,
)

# Ensure tasks are auto-discovered across api package
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])

@celery_app.task(name="ocr_image")
def ocr_image(image_bytes: bytes) -> str:
    """Run Tesseract OCR on raw image bytes and return extracted text."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        text: str = pytesseract.image_to_string(img) or ""
        return text
    except Exception as exc:  # pragma: no cover
        # Celery will log the exception and set the task state to FAILURE
        raise exc
