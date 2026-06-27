from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.kyc import KYCStatusResponse, KYCStatusUpdateRequest
from app.schemas.user import CurrentUser

router = APIRouter()


@router.get("/status", response_model=KYCStatusResponse, summary="Get the current user's KYC status")
async def get_kyc_status(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == int(current_user.id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return KYCStatusResponse(user_id=user.id, kyc_status=user.kyc_status)


@router.patch("/status", response_model=KYCStatusResponse, summary="Update a user's KYC status")
async def update_kyc_status(
    body: KYCStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(
        require_role(UserRole.admin, UserRole.compliance_officer)
    ),
):
    user = db.query(User).filter(User.id == body.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.kyc_status = body.status
    db.commit()
    db.refresh(user)

    return KYCStatusResponse(user_id=user.id, kyc_status=user.kyc_status)
