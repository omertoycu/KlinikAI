from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import verify_admin
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate

router = APIRouter(prefix="/doctors", tags=["doctors"])


def _to_out(d: Doctor) -> DoctorOut:
    return DoctorOut(
        id=d.id,
        name=d.name,
        specialty=d.specialty,
        working_hours=d.get_working_hours(),
        is_active=d.is_active,
    )


@router.get("/", response_model=list[DoctorOut])
def list_doctors(active_only: bool = True, db: Session = Depends(get_db)):
    try:
        query = db.query(Doctor)
        if active_only:
            query = query.filter(Doctor.is_active == True)
        return [_to_out(d) for d in query.all()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=DoctorOut, status_code=201)
def create_doctor(
    data: DoctorCreate, _: str = Depends(verify_admin), db: Session = Depends(get_db)
):
    try:
        doctor = Doctor(name=data.name, specialty=data.specialty, is_active=data.is_active)
        doctor.set_working_hours(data.working_hours)
        db.add(doctor)
        db.commit()
        db.refresh(doctor)
        return _to_out(doctor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{doctor_id}", response_model=DoctorOut)
def update_doctor(
    doctor_id: int,
    data: DoctorUpdate,
    _: str = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doktor bulunamadı")

        update_data = data.model_dump(exclude_none=True)
        if not update_data:
            return _to_out(doctor)

        for key, value in update_data.items():
            if key == "working_hours":
                doctor.set_working_hours(value)
            else:
                setattr(doctor, key, value)
        db.commit()
        db.refresh(doctor)
        return _to_out(doctor)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{doctor_id}", status_code=204)
def deactivate_doctor(
    doctor_id: int, _: str = Depends(verify_admin), db: Session = Depends(get_db)
):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doktor bulunamadı")
        doctor.is_active = False
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
