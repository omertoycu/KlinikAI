Sistem Mimarisi — Tam Açıklama

┌─────────────────────────────────────────────────────────────────┐
│                         TARAYICI                                │
│         http://localhost:5173  (React / Vite)                   │
│                                                                 │
│  /            → Vitrin + Chat widget                            │
│  /hasta-girisi→ Giriş / Kayıt formu                            │
│  /hesabim     → Hasta dashboard (randevularım)                  │
│  /admin       → Admin panel (token korumalı)                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (Axios, port 8000)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                             │
│                http://localhost:8000                             │
│                                                                 │
│  /api/auth/*        → JWT kayıt/giriş                           │
│  /api/doctors/*     → Doktor listesi                            │
│  /api/appointments/*→ Randevu CRUD + müsait slotlar             │
│  /api/chat/         → AI sohbet (RAG veya mock)                 │
│  /api/admin/*       → Belge yükleme/silme (admin token)         │
└───────┬────────────────────────┬────────────────────────────────┘
        │ psycopg2 (port 5432)   │ supabase-py (REST API, 443)
        ▼                        ▼
┌───────────────────┐   ┌────────────────────────────────────────┐
│  SUPABASE         │   │  SUPABASE (pgvector / REST)             │
│  PostgreSQL       │   │                                         │
│  (direkt bağlantı)│   │  Tablo: document_embeddings             │
│                   │   │  Fonksiyon: match_document_embeddings   │
│  Tablolar:        │   │  (AI döküman araması için)              │
│  • doctors        │   └─────────────────┬──────────────────────┘
│  • patients       │                     │ benzerlik araması
│  • appointments   │                     ▼
│  • knowledge_docs │        ┌────────────────────┐
└───────────────────┘        │  HuggingFace Model  │
                             │  all-MiniLM-L6-v2   │
                             │  (yerel cache)      │
                             └─────────┬───────────┘
                                       │ bağlam metni
                                       ▼
                             ┌────────────────────┐
                             │  GROQ API (LLM)    │
                             │  llama3-8b-8192    │
                             └────────────────────┘
Supabase'de Ne Oluyor — Detaylı
Supabase'i iki farklı protokolle kullanıyoruz:

1. PostgreSQL Direkt Bağlantı (SQLAlchemy + psycopg2)

backend/app/core/database.py
Her API isteğinde (randevu, hasta, doktor, auth) bu bağlantı açılıyor. Tablolar:

Tablo	Ne saklıyor
doctors	id, name, specialty, working_hours (JSON), is_active
patients	id, name, phone, email, password_hash, created_at
appointments	id, doctor_id, patient_name, patient_phone, datetime, status, note
knowledge_documents	id, filename, content_hash, uploaded_at, chunk_count
2. Supabase REST API (pgvector için)

backend/app/services/rag_service.py
AI sohbet için kullanılıyor. Tablo:

Tablo	Ne saklıyor
document_embeddings	id, content (metin), embedding (384 boyutlu vektör), metadata (JSON)
Supabase Dashboard'da Verileri Nereden Görürsün
Tarayıcıda aç: https://supabase.com/dashboard → Projen → Table Editor

Göreceğin tablolar:

doctors — seed.py ile eklenen 2 doktor burada
patients — kayıt olan hastalar
appointments — oluşturulan randevular
knowledge_documents — yüklenen PDF meta verileri
document_embeddings — AI vektörleri (SQL Editor'dan SELECT * FROM document_embeddings LIMIT 5 ile görülebilir)
Tespit Edilen 2 Kritik Hata
Hata 1: Aralıklı 500 Internal Server Error (IPv6 timeout)

psycopg2.OperationalError: connection to server at 
"db.akmvhmzjmpixccdvdsuw.supabase.co" 
(2406:da14:271:9913:ee26:bc1:4edd:6761)   ← IPv6!
port 5432 failed: timeout expired
Neden oluşuyor: Supabase'in ücretsiz planında direkt bağlantı (port 5432) artık yalnızca IPv6 üzerinden çalışıyor. Senin makinende IPv6 zaman zaman timeout veriyor. NullPool kullandığımız için her istek sıfırdan bağlantı açıyor — bağlantı tutulmuyor.

Çözüm: Supabase'in Session Pooler URL'ini kullanmak gerekiyor (IPv4, port 5432, pooler.supabase.com üzerinden). Bunu .env'de değiştireceğiz.

Hata 2: RAG Vector Search Başarısız

RAG vector search failed, falling back to mock: 
{'message': 'column reference "metadata" is ambiguous', 'code': '42702'}
Neden oluşuyor: Supabase'deki match_document_embeddings SQL fonksiyonunda metadata isimli hem tablo kolonu hem de PL/pgSQL değişkeni var — SQL çakışıyor. Bu fonksiyon Supabase SQL Editor'da oluşturulmuş ve içinde bug var.

Şimdi İki Hatayı da Düzeltelim
Düzeltme 1: Supabase Session Pooler URL'ini Al
Supabase Dashboard'a git:
Project Settings → Database → Connection string → Session Mode (port 5432)

URL şu formatta görünecek:


postgresql://postgres.akmvhmzjmpixccdvdsuw:[ŞİFRE]@aws-0-[BÖLGE].pooler.supabase.com:5432/postgres
.env dosyasını açıp DATABASE_URL satırını bu yeni URL ile güncelle.

Düzeltme 2: Supabase SQL Editor'da match_document_embeddings Fonksiyonunu Düzelt
Supabase Dashboard → SQL Editor → New Query, şunu çalıştır:


CREATE OR REPLACE FUNCTION match_document_embeddings(
  query_embedding vector(384),
  match_count int DEFAULT 4,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  embedding vector(384),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.content,
    de.metadata,
    de.embedding,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE de.metadata @> filter
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
Düzeltme 3: database.py'ye Retry Mekanizması (hemen uygulayabilirim)
IPv6 bağlantısı zaman zaman başarısız olduğunda otomatik retry ekleyeyim:

Edit c:\Users\omerf\klinik-ai\backend\app\core\database.py
Added 24 lines
Bash Test database connection with new pool settings
IN
cd c:/Users/omerf/klinik-ai/backend && venv/Scripts/python.exe -c "
import sys
sys.path.insert(0, '.')
from app.core.database import engine, SessionLocal
from app.models.doctor import Doctor

db = SessionLocal()
docs = db.query(Doctor).all()
for d in docs:
    print(f'  Doktor: {d.name} ({d.specialty})')
db.close()
print('DB bağlantısı OK')
" 2>&1

OUT
  Doktor: Dr. Ahmet Y�lmaz (Di� Hekimi)
  Doktor: Dyt. Fatma �ahin (Diyetisyen)
DB ba�lant�s� OK
Çalışıyor. Şimdi Supabase'de ne yapman gerektiğini adım adım göstereyim.

Yapman Gereken 2 Adım (Supabase Dashboard)
Adım 1 — Session Pooler URL'ini Al ve .env'e Yaz
Aç: https://supabase.com/dashboard/project/akmvhmzjmpixccdvdsuw/settings/database
"Connection string" bölümünde "Session mode" sekmesini seç
URI kopyala (şu formatta görünecek):

postgresql://postgres.akmvhmzjmpixccdvdsuw:[ŞİFRE]@aws-0-xx-xxxx.pooler.supabase.com:5432/postgres
.env dosyasında DATABASE_URL= satırını bu yeni URL ile değiştir, şifre kısmına mevcut şifreyi (f4zXULrUA@eRfw_ — URL encode'lu hali f4zXULrUA%40eRfw_) yaz.
Adım 2 — match_document_embeddings Fonksiyonunu Düzelt
Aç: https://supabase.com/dashboard/project/akmvhmzjmpixccdvdsuw/sql/new
Şu SQL'i yapıştır ve Run et:

CREATE OR REPLACE FUNCTION match_document_embeddings(
  query_embedding vector(384),
  match_count int DEFAULT 4,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  embedding vector(384),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.content,
    de.metadata,
    de.embedding,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE de.metadata @> filter
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
Sistemin Tam Veri Akışı — Özet

Kullanıcı "merhaba" yazar
        ↓
ChatWidget.tsx → POST /api/chat/ {"session_id":"...", "message":"merhaba"}
        ↓
chat.py router → rag_service.chat()
        ↓
_is_mock_mode()? → Groq key var + Supabase var → HAYIR
        ↓
_get_vectorstore() → HuggingFace embedding yükle → Supabase pgvector'a sorgu
        ↓
[Şu an BAŞARISIZ: metadata ambiguous SQL hatası → mock_chat fallback]
        ↓ (SQL düzeltildikten sonra)
Benzer doküman chunk'ları gelir → Groq LLM'e context olarak gönderilir
        ↓
Randevu niyeti varsa → <intent>{"intent":"book_appointment"}</intent> içerir
        ↓
Frontend bu intent'i görünce → AppointmentInlineForm açılır
        ↓
Kullanıcı formu doldurup gönderir → POST /api/appointments/
        ↓
Supabase appointments tablosuna kaydedilir ✓
Bu iki adımı yaptıktan sonra hem 500 hataları büyük ölçüde azalacak (retry mekanizması + pool zaten eklendi) hem de AI chat gerçek döküman bağlamıyla cevap verecek.