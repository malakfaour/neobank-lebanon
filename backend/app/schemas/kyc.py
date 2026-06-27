from pydantic import BaseModel

from app.models.user import KYCStatus
from app.models.kyc_record import KYCRecordStatus


class KYCStatusResponse(BaseModel):
    user_id: int
    kyc_status: KYCStatus


class KYCStatusUpdateRequest(BaseModel):
    user_id: int
    status: KYCStatus


class KYCUploadResponse(BaseModel):
    kyc_record_id: int
    selfie_url: str
    id_photo_url: str
    status: KYCRecordStatus
