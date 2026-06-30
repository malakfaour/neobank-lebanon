from unittest.mock import MagicMock, patch

from app.core import storage


def test_upload_file_returns_string_with_mocked_boto_client(monkeypatch):
    monkeypatch.setattr(storage.settings, "S3_BUCKET", "test-bucket")
    monkeypatch.setattr(storage.settings, "S3_REGION", "eu-central-1")
    monkeypatch.setattr(storage.settings, "AWS_ACCESS_KEY_ID", "test-key")
    monkeypatch.setattr(storage.settings, "AWS_SECRET_ACCESS_KEY", "test-secret")
    monkeypatch.setattr(storage.settings, "S3_ENDPOINT_URL", "https://storage.example.com")

    with patch.object(storage, "boto3") as mock_boto3:
        mock_boto3.client.return_value = MagicMock()

        client = storage._build_storage_client()
        result = storage.upload_file("/tmp/dummy-selfie.jpg", "kyc/dummy-selfie.jpg")

    mock_boto3.client.assert_called_once_with(
        service_name="s3",
        region_name="eu-central-1",
        aws_access_key_id="test-key",
        aws_secret_access_key="test-secret",
        endpoint_url="https://storage.example.com",
    )
    assert client is not None
    assert isinstance(result, str)
