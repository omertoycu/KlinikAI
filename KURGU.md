# Klinik AI — Uygulama Planı

## Context
Butik klinikler (diş, diyetisyen, güzellik merkezi) için B2B2C SaaS şablonu.  
Üç ana bileşen: premium vitrin landing page, gömülü RAG tabanlı AI chat widget, ve admin dashboard.  
Proje tamamen sıfırdan başlıyor; `frontend/` ve `backend/` klasörleri henüz yok.

---

## Geliştirme Fazları

### Faz 1 — Proje İskeleti
**Amaç:** Çalışan bir temel oluşturmak (kod yazılmadan önce her şey ayağa kalkmalı).

**Backend (`backend/`)**
```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt
├── .env.example
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── appointments.py
│   │   │   ├── chat.py
│   │   │   └── admin.py
│   ├── core/
│   │   ├── config.py       # Settings (Pydantic BaseSettings)
│   │   └── database.py     # SQLAlchemy engine + session
│   ├── models/
│   │   ├── appointment.py
│   │   ├── doctor.py
│   │   └── document.py
│   ├── schemas/            # Pydantic schemas
│   └── services/
│       ├── rag_service.py  # LangChain + Qdrant + OpenRouter
│       └── calendar.py     # Randevu mantığı
```

**Frontend (`frontend/`)**
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/             # Shadcn bileşenleri
│   │   ├── landing/        # Vitrin bileşenleri
│   │   ├── chat/           # AI widget bileşenleri
│   │   └── admin/          # Dashboard bileşenleri
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Admin.tsx
│   ├── hooks/
│   ├── lib/
│   │   └── api.ts          # Backend API client
│   └── main.tsx
```

**Kritik Dosyalar:**
- `backend/main.py` — FastAPI app + CORS + router mount
- `backend/app/core/config.py` — `OPENROUTER_API_KEY`, `QDRANT_PATH` env vars
- `backend/app/core/database.py` — SQLite bağlantısı
- `frontend/src/lib/api.ts` — Axios/fetch API client

---

### Faz 2 — Backend: Veritabanı ve Randevu API'si

**Modeller:**
- `Appointment` — id, doctor_id, patient_name, patient_phone, datetime, status, note
- `Doctor` — id, name, specialty, working_hours (JSON), is_active
- `KnowledgeDocument` — id, filename, content_hash, uploaded_at, chunk_count

**Endpoints:**
- `GET /api/appointments` — Tarih aralığına göre randevular
- `POST /api/appointments` — Yeni randevu oluştur
- `PATCH /api/appointments/{id}` — Durum güncelle / iptal et
- `GET /api/doctors` — Aktif doktorlar ve müsait saatleri
- `GET /api/slots` — Belirli tarihte boş slotlar

**Kullanılacak kütüphaneler:**
- `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic-settings`, `python-multipart`

---

### Faz 3 — AI/RAG Sistemi

**Bileşenler:**
1. **Qdrant** — Local/memory modunda vektör store
2. **LangChain** — Document loader (PDF), text splitter, embedding
3. **OpenRouter** — `openai` uyumlu API, model: `google/gemini-flash-1.5` veya `meta-llama/llama-3.1-8b-instruct` (düşük maliyet)

**RAG Pipeline (`rag_service.py`):**
```
PDF Upload → PyPDF2 → RecursiveCharacterTextSplitter 
→ Embedding (OpenRouter veya free model) → Qdrant store

User Question → Qdrant similarity search (top-k chunks)
→ Prompt template + context → OpenRouter LLM → Cevap
```

**Randevu Intent Detection:**
- LLM cevabı `{"intent": "book_appointment", "date": "...", "doctor_id": ...}` şeklinde JSON döndürebilir
- Frontend bu JSON'u yakalayıp randevu formunu açar

**Endpoints:**
- `POST /api/chat` — `{session_id, message}` → `{reply, intent?}`
- `POST /api/admin/upload` — PDF yükle, vektörize et
- `DELETE /api/admin/documents/{id}` — Vektör silme

**Kritik dosya:** `backend/app/services/rag_service.py`

---

### Faz 4 — Frontend: Landing Page (Vitrin)

**Bölümler (sections):**
1. **Hero** — Aceternity UI `BackgroundBeams` veya `SparklesCore` ile full-screen hero
2. **Services** — Hizmetler kartları (Shadcn Card)
3. **About** — Klinik/doktor tanıtımı
4. **Pricing** — Fiyat listesi (veriden dinamik)
5. **Testimonials** — Hasta yorumları
6. **CTA** — "Hemen Randevu Al" butonu (chat widget'ı açar)
7. **Footer** — İletişim, sosyal medya

**Tasarım kuralları:**
- Tailwind ile `dark:` varyantları (light/dark mode)
- Mobil-first responsive
- Animasyonlar için Framer Motion (Aceternity UI ile gelir)

---

### Faz 5 — AI Chat Widget

**Davranış:**
- Sayfanın sağ alt köşesinde floating button
- Açılınca tam ekran veya yan panel chat
- Mesaj geçmişi local storage'da
- Bot cevabı stream edilebilir (SSE veya polling)
- Randevu intent yakalanınca inline randevu formu gösterilir (isim, tel, tarih, saat seçimi)

**Bileşenler:**
- `ChatWidget.tsx` — Ana container, floating button
- `ChatMessages.tsx` — Mesaj listesi
- `ChatInput.tsx` — Metin kutusu + gönder
- `AppointmentInlineForm.tsx` — Intent sonrası form

---

### Faz 6 — Admin Dashboard (`/admin`)

**Sayfalar:**
- **Takvim Görünümü** — Günlük/haftalık randevu takvimi (react-big-calendar veya custom)
- **Randevu Listesi** — Tablo + durum filtreleri
- **AI Bilgi Yönetimi** — PDF yükleme, yüklü belgeler listesi, silme
- **Ayarlar** — Klinik adı, çalışma saatleri, doktor yönetimi

**Basit auth:** Admin rotaları için `?token=xxx` query param veya localStorage token (tam auth sistemi kapsam dışı başlangıçta).

---

## Geliştirme Sırası (Önerilen)

```
[1] Backend iskelet + DB + /api/appointments ✓ → test et
[2] RAG servisi + /api/chat endpoint ✓ → test et  
[3] Frontend iskelet + Landing Page ✓ → görsel test
[4] Chat Widget ✓ → backend ile entegre test
[5] Admin Dashboard ✓ → yükleme + takvim test
[6] Uçtan uca test: PDF yükle → soru sor → randevu al
```

---

## Ortam Değişkenleri (.env)
```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-flash-1.5
QDRANT_PATH=./qdrant_data        # local disk modu
DATABASE_URL=sqlite:///./klinik.db
ADMIN_TOKEN=changeme
```

---

## Doğrulama (Verification)
- Backend: `cd backend && uvicorn main:app --reload` → `http://localhost:8000/docs`
- Frontend: `cd frontend && npm run dev` → `http://localhost:5173`
- Chat testi: Landing page'de widget aç → "Fiyatlarınız nedir?" yaz → cevap kontrolü
- Randevu testi: "Yarın saat 10'a randevu almak istiyorum" → form açılıyor mu?
- Admin testi: `/admin` → PDF yükle → vektör sayısı arttı mı?
