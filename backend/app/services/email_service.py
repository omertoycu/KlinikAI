import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body_html: str) -> bool:
    """SMTP üzerinden email gönderir. Yapılandırılmamışsa sessizce atlar."""
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.info("Email atlandı: SMTP yapılandırılmamış")
        return False
    if not to:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_user
        msg["To"] = to
        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.ehlo()
            if settings.smtp_use_tls:
                server.starttls()
                server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to, msg.as_string())

        logger.info("Email gönderildi: %s — %s", to, subject)
        return True
    except Exception as exc:
        logger.error("Email gönderme hatası: %s", exc)
        return False


def _appt_email_html(
    patient_name: str,
    doctor_name: str,
    clinic_name: str,
    appointment_dt: str,
    note: str,
    cancel_token: str | None,
) -> str:
    cancel_section = ""
    if cancel_token and settings.app_url:
        cancel_url = f"{settings.app_url}/randevu-iptal/{cancel_token}"
        cancel_section = f'<p><a href="{cancel_url}" style="color:#ef4444">Randevuyu İptal Et</a></p>'

    return f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;
                background:#f8f8f8;border-radius:12px">
      <h2 style="color:#7c3aed;margin-bottom:4px">{clinic_name}</h2>
      <h3 style="color:#111;margin-top:0">Randevu Onayı</h3>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#555;width:40%">Hasta</td>
            <td style="padding:8px 0;font-weight:600">{patient_name}</td></tr>
        <tr><td style="padding:8px 0;color:#555">Doktor</td>
            <td style="padding:8px 0;font-weight:600">{doctor_name}</td></tr>
        <tr><td style="padding:8px 0;color:#555">Tarih & Saat</td>
            <td style="padding:8px 0;font-weight:600">{appointment_dt}</td></tr>
        {"<tr><td style='padding:8px 0;color:#555'>Not</td><td style='padding:8px 0'>" + note + "</td></tr>" if note else ""}
      </table>
      {cancel_section}
      <p style="color:#888;font-size:12px;margin-top:24px">{clinic_name} — Klinik AI</p>
    </div>
    """


def send_appointment_email(
    to: str,
    patient_name: str,
    doctor_name: str,
    clinic_name: str,
    appointment_dt: str,
    note: str = "",
    cancel_token: str | None = None,
) -> bool:
    subject = f"{clinic_name} — Randevu Onayı: {appointment_dt}"
    html = _appt_email_html(patient_name, doctor_name, clinic_name, appointment_dt, note, cancel_token)
    return send_email(to, subject, html)


def send_clinic_notification_email(
    patient_name: str,
    patient_phone: str,
    doctor_name: str,
    clinic_email: str,
    appointment_dt: str,
    note: str = "",
) -> bool:
    """Klinik yöneticisine yeni randevu bildirimi gönderir."""
    subject = f"Yeni Randevu: {patient_name} — {appointment_dt}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h3>Yeni Randevu Bildirimi</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#555;width:40%">Hasta</td>
            <td style="padding:6px 0;font-weight:600">{patient_name}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Telefon</td>
            <td style="padding:6px 0">{patient_phone}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Doktor</td>
            <td style="padding:6px 0">{doctor_name}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Tarih & Saat</td>
            <td style="padding:6px 0;font-weight:600">{appointment_dt}</td></tr>
        {"<tr><td style='padding:6px 0;color:#555'>Not</td><td style='padding:6px 0'>" + note + "</td></tr>" if note else ""}
      </table>
    </div>
    """
    return send_email(clinic_email, subject, html)
