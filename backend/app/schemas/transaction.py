from decimal import Decimal
from pydantic import BaseModel, Field


class SendMoneyRequest(BaseModel):
    receiver_id: str
    amount: Decimal = Field(..., gt=0)
    currency: str  # "USD" | "LBP" | "USDT"