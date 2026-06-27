import enum
from sqlalchemy import Column, Integer, Numeric, String, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.core.database import Base

class CurrencyEnum(str, enum.Enum):
    USD = "USD"
    LBP = "LBP"
    USDT = "USDT"

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    currency = Column(Enum(CurrencyEnum), nullable=False)
    balance = Column(Numeric(18, 4), default=0)
    account_number = Column(String(16), unique=True, nullable=True)
    iban = Column(String(34), unique=True, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "currency", name="uq_wallet_user_currency"),
    )