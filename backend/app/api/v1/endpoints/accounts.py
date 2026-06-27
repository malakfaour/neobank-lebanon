from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.account_service import create_wallets_for_user

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/create")
async def create_account(user_id: int, db: AsyncSession = Depends(get_db)):
    """Auto-create 3 wallets for a user at balance=0"""
    try:
        wallets = await create_wallets_for_user(user_id, db)
        return {
            "message": "Wallets created successfully",
            "user_id": user_id,
            "wallets_created": len(wallets)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))