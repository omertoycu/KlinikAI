from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate
from app.services.calendar import get_available_slots

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/", response_model=list[AppointmentOut])
def list_appointments(
    start: date | None = None,
    end: date | None = None,
    doctor_id: int | None = None,
    patient_phone: str | None = None,
    db: Session = Depends(get_db),
):
    try:
        query = db.query(Appointment)
        if start:
            query = query.filter(Appointment.datetime >= start)
        if end:
            query = query.filter(Appointment.datetime <= end)
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if patient_phone:
            query = query.filter(Appointment.patient_phone == patient_phone)
        return query.order_by(Appointment.datetime).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=AppointmentOut, status_code=201)
def create_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id, Doctor.is_active == True).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doktor bulunamadı")

        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == data.doctor_id,
            Appointment.datetime == data.datetime,
            Appointment.status != "cancelled",
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail="Bu saat dolu")

        appointment = Appointment(**data.model_dump())
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(appointment_id: int, data: AppointmentUpdate, db: Session = Depends(get_db)):
    try:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Randevu bulunamadı")

        for field, value in data.model_dump(exclude_none=True).items():
            setattr(appointment, field, value)

        db.commit()
        db.refresh(appointment)
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/slots")
def available_slots(doctor_id: int, date: date, db: Session = Depends(get_db)):
    try:
        slots = get_available_slots(db, doctor_id, date)
        return {"slots": slots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
