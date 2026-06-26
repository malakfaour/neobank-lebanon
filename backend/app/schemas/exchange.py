from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel


class ExchangeRateResponse(BaseModel):
    base_currency: str
    target_currency: str
    rate: Decimal
    provider: str | None = None
    last_updated_at: datetime | None = None


class ConvertCurrencyResponse(BaseModel):
    from_currency: str
    to_currency: str
    amount: Decimal
    rate: Decimal
    converted_amount: Decimal