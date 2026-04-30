from pydantic import BaseModel


class DoctorBase(BaseModel):
    name: str
    specialty: str
    working_hours: dict = {}
    is_active: bool = True


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    name: str | None = None
    specialty: str | None = None
    working_hours: dict | None = None
    is_active: bool | None = None


class DoctorOut(DoctorBase):
    id: int

    model_config = {"from_attributes": True}
