from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.wallet import Wallet, WalletCurrency
from app.utils.account_utils import generate_account_number, generate_iban

async def create_wallets_for_user(user_id: int, db: AsyncSession):
    wallets = []
    for currency in WalletCurrency:
        result = await db.execute(
            select(Wallet).where(
                Wallet.user_id == user_id,
                Wallet.currency == currency
            )
        )
        existing = result.scalar_one_or_none()
        if not existing:
            account_number = generate_account_number()
            iban = generate_iban(account_number)
            wallet = Wallet(
                user_id=user_id,
                currency=currency,
                balance=0,
                account_number=account_number,
                iban=iban
            )
            db.add(wallet)
            wallets.append(wallet)

    await db.commit()
    return wallets
