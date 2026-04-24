from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class PatientRegister(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    password: str

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return v.strip().replace(" ", "")


class PatientLogin(BaseModel):
    phone: str
    password: str


class PatientOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    patient: PatientOut
