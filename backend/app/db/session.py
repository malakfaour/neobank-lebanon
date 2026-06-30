from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


def _get_async_database_url() -> str:
    if settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
        return settings.DATABASE_URL
    if settings.DATABASE_URL.startswith("postgresql://"):
        return settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    if settings.DATABASE_URL.startswith("postgres://"):
        return settings.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    return settings.DATABASE_URL


engine = create_engine(settings.DATABASE_URL)
async_engine = create_async_engine(_get_async_database_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db():
    async with AsyncSessionLocal() as db:
        yield db
