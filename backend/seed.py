"""Demo verisi eklemek için çalıştırın: python seed.py"""
import json
from app.core.database import Base, SessionLocal, engine
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(Doctor).count() == 0:
    doctors = [
        Doctor(
            name="Dr. Ahmet Yılmaz",
            specialty="Diş Hekimi",
            working_hours=json.dumps({
                "monday":    {"start": "09:00", "end": "17:00"},
                "tuesday":   {"start": "09:00", "end": "17:00"},
                "wednesday": {"start": "09:00", "end": "17:00"},
                "thursday":  {"start": "09:00", "end": "17:00"},
                "friday":    {"start": "09:00", "end": "17:00"},
            }),
            is_active=True,
        ),
        Doctor(
            name="Dyt. Fatma Şahin",
            specialty="Diyetisyen",
            working_hours=json.dumps({
                "monday":    {"start": "10:00", "end": "18:00"},
                "wednesday": {"start": "10:00", "end": "18:00"},
                "friday":    {"start": "10:00", "end": "16:00"},
            }),
            is_active=True,
        ),
    ]
    db.add_all(doctors)
    db.commit()
    print("✓ 2 doktor eklendi.")
else:
    print("Doktorlar zaten mevcut, atlandı.")

db.close()
print("Seed tamamlandı.")
