from sqlalchemy import Column, String, Text
from app.core.database import Base


class ClinicSetting(Base):
    __tablename__ = "clinic_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, default="")


# Varsayılan ayarlar — DB boşsa kullanılır
DEFAULTS: dict[str, str] = {
    "clinic_name": "Klinik AI",
    "clinic_phone": "",
    "clinic_email": "",
    "clinic_address": "",
    "primary_color": "#7c3aed",
    "welcome_message": "Merhaba! Size nasıl yardımcı olabilirim?",
    "logo_url": "",
    "app_url": "",
}
