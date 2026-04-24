import json
from sqlalchemy import Boolean, Column, Integer, String, Text
from app.core.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    specialty = Column(String(200), nullable=False)
    working_hours = Column(Text, default="{}")  # JSON string
    is_active = Column(Boolean, default=True)

    def get_working_hours(self) -> dict:
        return json.loads(self.working_hours or "{}")

    def set_working_hours(self, hours: dict):
        self.working_hours = json.dumps(hours, ensure_ascii=False)
