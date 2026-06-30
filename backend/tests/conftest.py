import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_neobank.db")
os.environ.setdefault("DATABASE_URL_DIRECT", "sqlite:///./test_neobank.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")

os.environ.setdefault("JWT_SECRET", "test_secret_key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "30")
os.environ.setdefault("JWT_REFRESH_EXPIRE_DAYS", "7")
os.environ.setdefault("OTP_EXPIRE_MINUTES", "5")

os.environ.setdefault("APP_ENV", "test")

os.environ.setdefault("DEEPFACE_MODEL", "ArcFace")
os.environ.setdefault("GROQ_API_KEY", "test_groq_key")

os.environ.setdefault("AWS_ACCESS_KEY_ID", "test_access_key")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test_secret_key")
os.environ.setdefault("AWS_BUCKET_NAME", "test-bucket")
os.environ.setdefault("AWS_REGION", "eu-central-1")

os.environ.setdefault("SMTP_HOST", "smtp.gmail.com")
os.environ.setdefault("SMTP_PORT", "587")
os.environ.setdefault("SMTP_USER", "test@example.com")
os.environ.setdefault("SMTP_PASSWORD", "test_password")