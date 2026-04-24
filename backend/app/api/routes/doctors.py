import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorOut

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("/", response_model=list[DoctorOut])
def list_doctors(active_only: bool = True, db: Session = Depends(get_db)):
    try:
        query = db.query(Doctor)
        if active_only:
            query = query.filter(Doctor.is_active == True)
        doctors = query.all()
        result = []
        for d in doctors:
            out = DoctorOut(
                id=d.id,
                name=d.name,
                specialty=d.specialty,
                working_hours=d.get_working_hours(),
                is_active=d.is_active,
            )
            result.append(out)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=DoctorOut, status_code=201)
def create_doctor(data: DoctorCreate, db: Session = Depends(get_db)):
    try:
        doctor = Doctor(
            name=data.name,
            specialty=data.specialty,
            is_active=data.is_active,
        )
        doctor.set_working_hours(data.working_hours)
        db.add(doctor)
        db.commit()
        db.refresh(doctor)
        return DoctorOut(
            id=doctor.id,
            name=doctor.name,
            specialty=doctor.specialty,
            working_hours=doctor.get_working_hours(),
            is_active=doctor.is_active,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{doctor_id}", status_code=204)
def deactivate_doctor(doctor_id: int, db: Session = Depends(get_db)):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doktor bulunamadı")
        doctor.is_active = False
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
