import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


def _normalize_phone(phone: str) -> str:
    phone = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if phone.startswith("+90"):
        phone = phone[3:]
    elif phone.startswith("90") and len(phone) == 12:
        phone = phone[2:]
    elif phone.startswith("0"):
        phone = phone[1:]
    return phone


def send_sms(phone: str, message: str) -> bool:
    """Netgsm üzerinden SMS gönderir. Kimlik bilgileri yoksa sessizce atlar."""
    if not settings.netgsm_usercode or not settings.netgsm_password:
        logger.info("SMS atlandı: Netgsm kimlik bilgileri yapılandırılmamış")
        return False

    normalized = _normalize_phone(phone)
    if len(normalized) != 10:
        logger.warning("Geçersiz telefon numarası: %s", phone)
        return False

    try:
        response = httpx.get(
            "https://api.netgsm.com.tr/sms/send/get/",
            params={
                "usercode": settings.netgsm_usercode,
                "password": settings.netgsm_password,
                "gsmno": normalized,
                "message": message,
                "msgheader": settings.netgsm_header,
                "dil": "TR",
            },
            timeout=10,
        )
        code = response.text.strip().split()[0] if response.text.strip() else "ERR"
        if code == "00":
            logger.info("SMS gönderildi: %s", normalized)
            return True
        logger.warning("SMS gönderilemedi — Netgsm kodu: %s", code)
        return False
    except Exception as exc:
        logger.error("SMS gönderme hatası: %s", exc)
        return False


def send_appointment_sms(
    patient_name: str,
    patient_phone: str,
    doctor_name: str,
    clinic_name: str,
    appointment_dt: str,
    cancel_token: str | None = None,
) -> bool:
    lines = [
        f"Sayın {patient_name},",
        f"{clinic_name} kliniğinde {doctor_name} ile {appointment_dt} tarihli randevunuz oluşturulmuştur.",
    ]
    if cancel_token and settings.app_url:
        lines.append(f"İptal için: {settings.app_url}/randevu-iptal/{cancel_token}")

    return send_sms(patient_phone, " ".join(lines))


def send_cancellation_sms(
    patient_name: str,
    patient_phone: str,
    doctor_name: str,
    clinic_name: str,
    appointment_dt: str,
) -> bool:
    msg = (
        f"Sayın {patient_name}, {clinic_name} kliniğindeki "
        f"{doctor_name} ile {appointment_dt} tarihli randevunuz iptal edilmiştir."
    )
    return send_sms(patient_phone, msg)
