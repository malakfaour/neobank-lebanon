from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.services.account_service import create_wallets_for_user
from app.models.wallet import Wallet

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

@router.get("/balance")
async def get_balance(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get all wallet balances for a user — reads fresh from DB"""
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == user_id)
    )
    wallets = result.scalars().all()

    if not wallets:
        raise HTTPException(status_code=404, detail="No wallets found for this user")

    return {
        "user_id": user_id,
        "balances": [
            {
                "currency": w.currency,
                "balance": float(w.balance)
            }
            for w in wallets
        ]
    }