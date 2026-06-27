from __future__ import annotations

from typing import Any

try:
    import boto3
except ImportError:  # pragma: no cover - covered indirectly once boto3 is installed
    boto3 = None

from app.core.config import settings


def _get_bucket_name() -> str:
    return settings.S3_BUCKET or settings.AWS_BUCKET_NAME


def _get_region_name() -> str:
    return settings.S3_REGION or settings.AWS_REGION


def _build_storage_client() -> Any | None:
    if boto3 is None:
        return None

    bucket_name = _get_bucket_name()
    region_name = _get_region_name()

    if not all(
        [
            bucket_name,
            region_name,
            settings.AWS_ACCESS_KEY_ID,
            settings.AWS_SECRET_ACCESS_KEY,
        ]
    ):
        return None

    client_kwargs = {
        "service_name": "s3",
        "region_name": region_name,
        "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
        "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
    }

    if settings.S3_ENDPOINT_URL:
        client_kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

    return boto3.client(**client_kwargs)


storage_client = _build_storage_client()


def upload_file(file_path: str, destination_key: str) -> str:
    # Week 2 will replace this stub with the real S3 upload flow.
    _ = destination_key
    return file_path
