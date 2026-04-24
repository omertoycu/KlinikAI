from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.patient import Patient
from app.schemas.patient import PatientLogin, PatientOut, PatientRegister, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


def get_current_patient(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> Patient:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token gerekli")
    try:
        patient_id = decode_access_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")
    return patient


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: PatientRegister, db: Session = Depends(get_db)):
    if db.query(Patient).filter(Patient.phone == body.phone).first():
        raise HTTPException(status_code=400, detail="Bu telefon numarası zaten kayıtlı")
    if body.email and db.query(Patient).filter(Patient.email == body.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")

    patient = Patient(
        name=body.name,
        phone=body.phone,
        email=body.email or None,
        password_hash=hash_password(body.password),
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    return TokenResponse(
        access_token=create_access_token(patient.id),
        patient=PatientOut.model_validate(patient),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: PatientLogin, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.phone == body.phone).first()
    if not patient or not verify_password(body.password, patient.password_hash):
        raise HTTPException(status_code=401, detail="Telefon veya şifre hatalı")

    return TokenResponse(
        access_token=create_access_token(patient.id),
        patient=PatientOut.model_validate(patient),
    )


@router.get("/me", response_model=PatientOut)
def me(current: Patient = Depends(get_current_patient)):
    return PatientOut.model_validate(current)
