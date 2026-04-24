from pydantic import BaseModel


class DoctorBase(BaseModel):
    name: str
    specialty: str
    working_hours: dict = {}
    is_active: bool = True


class DoctorCreate(DoctorBase):
    pass


class DoctorOut(DoctorBase):
    id: int

    model_config = {"from_attributes": True}
