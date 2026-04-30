import secrets
from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.clinic_settings import ClinicSetting, DEFAULTS
from app.models.doctor import Doctor
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate
from app.services import email_service, sms_service

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _get_setting(key: str, db: Session) -> str:
    setting = db.query(ClinicSetting).filter(ClinicSetting.key == key).first()
    return setting.value if setting else DEFAULTS.get(key, "")


def _format_dt(dt: datetime) -> str:
    return dt.strftime("%d.%m.%Y %H:%M")


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
            query = query.filter(Appointment.datetime >= datetime.combine(start, time.min))
        if end:
            query = query.filter(Appointment.datetime <= datetime.combine(end, time.max))
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
        doctor = db.query(Doctor).filter(
            Doctor.id == data.doctor_id, Doctor.is_active == True
        ).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doktor bulunamadı")

        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == data.doctor_id,
            Appointment.datetime == data.datetime,
            Appointment.status != "cancelled",
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail="Bu saat dolu")

        cancel_token = secrets.token_urlsafe(32)
        apt = Appointment(
            doctor_id=data.doctor_id,
            patient_name=data.patient_name,
            patient_phone=data.patient_phone,
            patient_email=data.patient_email,
            datetime=data.datetime,
            note=data.note,
            status="pending",
            cancel_token=cancel_token,
        )
        db.add(apt)
        db.commit()
        db.refresh(apt)

        clinic_name = _get_setting("clinic_name", db)
        clinic_email = _get_setting("clinic_email", db)
        dt_str = _format_dt(apt.datetime)

        sms_service.send_appointment_sms(
            patient_name=apt.patient_name,
            patient_phone=apt.patient_phone,
            doctor_name=doctor.name,
            clinic_name=clinic_name,
            appointment_dt=dt_str,
            cancel_token=cancel_token,
        )
        if apt.patient_email:
            email_service.send_appointment_email(
                to=apt.patient_email,
                patient_name=apt.patient_name,
                doctor_name=doctor.name,
                clinic_name=clinic_name,
                appointment_dt=dt_str,
                note=apt.note or "",
                cancel_token=cancel_token,
            )
        if clinic_email:
            email_service.send_clinic_notification_email(
                patient_name=apt.patient_name,
                patient_phone=apt.patient_phone,
                doctor_name=doctor.name,
                clinic_email=clinic_email,
                appointment_dt=dt_str,
                note=apt.note or "",
            )

        return apt
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int, data: AppointmentUpdate, db: Session = Depends(get_db)
):
    try:
        apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not apt:
            raise HTTPException(status_code=404, detail="Randevu bulunamadı")

        update_data = data.model_dump(exclude_none=True)
        if not update_data:
            return apt

        prev_status = apt.status
        for key, value in update_data.items():
            setattr(apt, key, value)
        db.commit()
        db.refresh(apt)

        if data.status == "cancelled" and prev_status != "cancelled":
            doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
            sms_service.send_cancellation_sms(
                patient_name=apt.patient_name,
                patient_phone=apt.patient_phone,
                doctor_name=doctor.name if doctor else "",
                clinic_name=_get_setting("clinic_name", db),
                appointment_dt=_format_dt(apt.datetime),
            )

        return apt
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel/{token}", response_model=AppointmentOut)
def cancel_by_token(token: str, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.cancel_token == token).first()
    if not apt:
        raise HTTPException(
            status_code=404, detail="Geçersiz veya süresi dolmuş iptal bağlantısı"
        )

    if apt.status == "cancelled":
        raise HTTPException(status_code=409, detail="Bu randevu zaten iptal edilmiş")

    apt.status = "cancelled"
    db.commit()
    db.refresh(apt)

    doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
    sms_service.send_cancellation_sms(
        patient_name=apt.patient_name,
        patient_phone=apt.patient_phone,
        doctor_name=doctor.name if doctor else "",
        clinic_name=_get_setting("clinic_name", db),
        appointment_dt=_format_dt(apt.datetime),
    )
    return apt


@router.get("/slots")
def available_slots(doctor_id: int, date: date, db: Session = Depends(get_db)):
    try:
        from app.services.calendar import get_available_slots

        slots = get_available_slots(doctor_id, date, db)
        return {"slots": slots}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
