from datetime import datetime
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_id: int
    patient_name: str
    patient_phone: str
    patient_email: str | None = None
    datetime: datetime
    note: str = ""


class AppointmentUpdate(BaseModel):
    status: str | None = None
    note: str | None = None


class AppointmentOut(BaseModel):
    id: int
    doctor_id: int
    patient_name: str
    patient_phone: str
    patient_email: str | None
    datetime: datetime
    status: str
    note: str
    cancel_token: str | None

    model_config = {"from_attributes": True}
