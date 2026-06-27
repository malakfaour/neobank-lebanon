from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.kyc_record import KYCRecord, KYCRecordStatus
from app.models.user import User, UserRole
from app.schemas.kyc import (
    KYCStatusResponse,
    KYCStatusUpdateRequest,
    KYCUploadResponse,
)
from app.schemas.user import CurrentUser

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"}
IMAGE_SUFFIXES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
}
UPLOAD_DIR = Path("/tmp")


def _validate_image_upload(upload: UploadFile, field_name: str) -> None:
    if upload.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a JPEG or PNG image",
        )


async def _save_upload_to_tmp(upload: UploadFile) -> str:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = IMAGE_SUFFIXES[upload.content_type]
    file_path = UPLOAD_DIR / f"{uuid4()}{suffix}"
    file_bytes = await upload.read()

    with file_path.open("wb") as buffer:
        buffer.write(file_bytes)

    await upload.close()
    return str(file_path)


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


@router.post(
    "/upload",
    response_model=KYCUploadResponse,
    summary="Upload KYC verification documents",
)
async def upload_kyc_documents(
    selfie: UploadFile = File(...),
    id_photo: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_image_upload(selfie, "selfie")
    _validate_image_upload(id_photo, "id_photo")

    user = db.query(User).filter(User.id == int(current_user.id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    selfie_path = await _save_upload_to_tmp(selfie)
    id_photo_path = await _save_upload_to_tmp(id_photo)

    kyc_record = db.query(KYCRecord).filter(KYCRecord.user_id == user.id).first()
    if not kyc_record:
        kyc_record = KYCRecord(user_id=user.id)
        db.add(kyc_record)

    kyc_record.selfie_url = selfie_path
    kyc_record.id_photo_url = id_photo_path
    kyc_record.match_score = None
    kyc_record.status = KYCRecordStatus.pending
    kyc_record.reviewed_at = None

    db.commit()
    db.refresh(kyc_record)

    return KYCUploadResponse(
        kyc_record_id=kyc_record.id,
        selfie_url=kyc_record.selfie_url,
        id_photo_url=kyc_record.id_photo_url,
        status=kyc_record.status,
    )


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
