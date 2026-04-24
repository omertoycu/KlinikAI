from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.doctor import Doctor


SLOT_DURATION_MINUTES = 30


def get_available_slots(db: Session, doctor_id: int, target_date: date) -> list[str]:
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id, Doctor.is_active == True).first()
    if not doctor:
        return []

    hours = doctor.get_working_hours()
    day_name = target_date.strftime("%A").lower()  # e.g. "monday"
    day_schedule = hours.get(day_name)
    if not day_schedule:
        return []

    start_h, start_m = map(int, day_schedule["start"].split(":"))
    end_h, end_m = map(int, day_schedule["end"].split(":"))

    start_dt = datetime(target_date.year, target_date.month, target_date.day, start_h, start_m)
    end_dt = datetime(target_date.year, target_date.month, target_date.day, end_h, end_m)

    booked = {
        a.datetime
        for a in db.query(Appointment).filter(
            Appointment.doctor_id == doctor_id,
            Appointment.status != "cancelled",
            Appointment.datetime >= start_dt,
            Appointment.datetime < end_dt,
        )
    }

    slots = []
    current = start_dt
    now = datetime.now()
    while current < end_dt:
        if current not in booked and current > now:
            slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=SLOT_DURATION_MINUTES)

    return slots
