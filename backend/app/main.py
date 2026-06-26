from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import redis_client
from app.api.v1.endpoints.auth import router as auth_router
from app.api.dependencies import get_current_user
from app.schemas.user import CurrentUser

app = FastAPI(
    title="NeoBank Lebanon API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    try:
        await redis_client.ping()
        redis_status = "ok"
    except Exception:
        redis_status = "unavailable"
    return {
        "status": "ok",
        "env": settings.APP_ENV,
        "redis": redis_status
    }

@app.get("/me", tags=["auth"])
async def get_me(current_user: CurrentUser = Depends(get_current_user)):
    """Protected route — returns current authenticated user."""
    return {"user_id": current_user.id}