from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.wallet import Wallet, CurrencyEnum

async def create_wallets_for_user(user_id: int, db: AsyncSession):
    """Auto-create 3 wallets (USD, LBP, USDT) for a new user at balance=0"""
    wallets = []
    for currency in CurrencyEnum:
        # Check if wallet already exists
        result = await db.execute(
            select(Wallet).where(
                Wallet.user_id == user_id,
                Wallet.currency == currency
            )
        )
        existing = result.scalar_one_or_none()
        if not existing:
            wallet = Wallet(user_id=user_id, currency=currency, balance=0)
            db.add(wallet)
            wallets.append(wallet)

    await db.commit()
    return wallets