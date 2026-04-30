from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import appointments, chat, admin, doctors, auth
from app.api.routes import settings as settings_router
from app.api.routes import analytics as analytics_router

app = FastAPI(title="Klinik AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(appointments.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(analytics_router.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "message": "Klinik AI API çalışıyor"}
