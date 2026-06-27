from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_URL_DIRECT: str
    REDIS_URL: str = "redis://localhost:6379"
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    APP_ENV: str = "development"
    DEEPFACE_MODEL: str = "ArcFace"
    GROQ_API_KEY: str = ""
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"

    model_config = {"env_file": "../.env", "extra": "allow"}

settings = Settings()