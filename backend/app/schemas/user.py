from pydantic import BaseModel

class TokenPayload(BaseModel):
    sub: str        # user ID
    jti: str        # token unique ID
    type: str       # "access" or "refresh"

class CurrentUser(BaseModel):
    id: str
    token_jti: str