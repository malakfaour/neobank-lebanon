import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class WalletCurrency(str, enum.Enum):
    USD = "USD"
    LBP = "LBP"
    USDT = "USDT"


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    currency = Column(SAEnum(WalletCurrency), nullable=False)
    balance = Column(Float, nullable=False, default=0.0, server_default="0")
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="wallets")
