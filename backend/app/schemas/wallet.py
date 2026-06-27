from pydantic import BaseModel
from enum import Enum

class CurrencyEnum(str, Enum):
    USD = "USD"
    LBP = "LBP"
    USDT = "USDT"

class WalletResponse(BaseModel):
    id: int
    user_id: int
    currency: CurrencyEnum
    balance: float

    class Config:
        from_attributes = True