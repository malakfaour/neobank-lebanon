from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query

from app.schemas.exchange import ConvertCurrencyResponse, ExchangeRateResponse
from app.services.exchange_cache import (
    get_cached_exchange_rates,
    set_cached_exchange_rates,
)
from app.services.market_hours import get_market_status, is_market_open


router = APIRouter(prefix="/exchange", tags=["exchange"])


STUB_RATES = {
    ("USD", "LBP"): Decimal("89500"),
    ("EUR", "USD"): Decimal("1.08"),
    ("USD", "EUR"): Decimal("0.92"),
}


@router.get("/market-status")
def market_status():
    return get_market_status()


@router.get("/rates", response_model=list[ExchangeRateResponse])
async def get_exchange_rates():
    cached_rates = await get_cached_exchange_rates()

    if cached_rates is None:
        await set_cached_exchange_rates(STUB_RATES)
        rates = STUB_RATES
        provider = "stub"
    else:
        rates = cached_rates
        provider = "redis-cache"

    return [
        {
            "base_currency": base,
            "target_currency": target,
            "rate": rate,
            "provider": provider,
            "last_updated_at": None,
        }
        for (base, target), rate in rates.items()
    ]


@router.get("/convert", response_model=ConvertCurrencyResponse)
async def convert_currency(
    amount: Decimal = Query(..., gt=0),
    from_currency: str = Query(..., min_length=3, max_length=3),
    to_currency: str = Query(..., min_length=3, max_length=3),
):
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    if not is_market_open():
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Exchange market is currently closed",
                **get_market_status(),
            },
        )

    cached_rates = await get_cached_exchange_rates()

    if cached_rates is None:
        await set_cached_exchange_rates(STUB_RATES)
        rates = STUB_RATES
    else:
        rates = cached_rates

    rate = rates.get((from_currency, to_currency), Decimal("1"))
    converted_amount = amount * rate

    return {
        "from_currency": from_currency,
        "to_currency": to_currency,
        "amount": amount,
        "rate": rate,
        "converted_amount": converted_amount,
    }