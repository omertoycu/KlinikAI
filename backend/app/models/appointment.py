from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    patient_name = Column(String(200), nullable=False)
    patient_phone = Column(String(20), nullable=False)
    patient_email = Column(String(255), nullable=True)  # opsiyonel, email bildirimi için
    datetime = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), default="pending")  # pending | confirmed | cancelled
    note = Column(Text, default="")
    cancel_token = Column(String(64), unique=True, nullable=True, index=True)

    doctor = relationship("Doctor")
