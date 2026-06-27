from pydantic import BaseModel

from app.models.user import KYCStatus


class KYCStatusResponse(BaseModel):
    user_id: int
    kyc_status: KYCStatus


class KYCStatusUpdateRequest(BaseModel):
    user_id: int
    status: KYCStatus
