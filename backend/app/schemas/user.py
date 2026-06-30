from enum import Enum
from pydantic import BaseModel


class UserRole(str, Enum):
    customer = "customer"
    compliance_officer = "compliance_officer"
    admin = "admin"


class TokenPayload(BaseModel):
    sub: str        # user ID
    jti: str        # token unique ID
    type: str       # "access" or "refresh"


class CurrentUser(BaseModel):
    id: str
    token_jti: str
    role: UserRole = UserRole.customer


class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str


class UserRegisterResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
