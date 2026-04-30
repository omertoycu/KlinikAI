from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import verify_admin
from app.models.clinic_settings import ClinicSetting, DEFAULTS

router = APIRouter(prefix="/settings", tags=["settings"])


def _all_settings(db: Session) -> dict[str, str]:
    rows = {s.key: s.value for s in db.query(ClinicSetting).all()}
    return {k: rows.get(k, v) for k, v in DEFAULTS.items()}


@router.get("/public")
def public_settings(db: Session = Depends(get_db)):
    public_keys = {"clinic_name", "primary_color", "welcome_message", "logo_url"}
    return {k: v for k, v in _all_settings(db).items() if k in public_keys}


@router.get("/")
def get_settings(db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    return _all_settings(db)


@router.patch("/")
def update_settings(
    data: dict[str, str],
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    for key, value in data.items():
        if key not in DEFAULTS:
            continue
        setting = db.query(ClinicSetting).filter(ClinicSetting.key == key).first()
        if setting:
            setting.value = value
        else:
            db.add(ClinicSetting(key=key, value=value))
    db.commit()
    return _all_settings(db)
