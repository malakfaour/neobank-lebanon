from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.schemas.transaction import SendMoneyRequest
from app.schemas.user import CurrentUser

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/send")
async def send_money(
    payload: SendMoneyRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented",
    )