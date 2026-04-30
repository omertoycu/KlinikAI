-- ============================================================
-- Neon PostgreSQL Kurulum Scripti
-- Neon Dashboard > SQL Editor'da bir kez çalıştırın
-- ============================================================

-- 1. pgvector eklentisi (RAG embeddings için)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Uygulama tabloları
--    Not: seed.py çalıştırıldığında SQLAlchemy da bunları oluşturur.
--    Bu script manuel kurulum veya sıfırlama içindir.

CREATE TABLE IF NOT EXISTS doctors (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(200) NOT NULL,
    specialty VARCHAR(200) NOT NULL DEFAULT '',
    working_hours TEXT DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS patients (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    phone         VARCHAR(20)  UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id             SERIAL PRIMARY KEY,
    doctor_id      INTEGER REFERENCES doctors(id) NOT NULL,
    patient_name   VARCHAR(200) NOT NULL,
    patient_phone  VARCHAR(20)  NOT NULL,
    patient_email  VARCHAR(255),
    datetime       TIMESTAMP NOT NULL,
    status         VARCHAR(20) DEFAULT 'pending',
    note           TEXT DEFAULT '',
    cancel_token   VARCHAR(64) UNIQUE
);

CREATE INDEX IF NOT EXISTS ix_appointments_datetime     ON appointments(datetime);
CREATE INDEX IF NOT EXISTS ix_appointments_cancel_token ON appointments(cancel_token);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id           SERIAL PRIMARY KEY,
    filename     VARCHAR(500) NOT NULL,
    content_hash VARCHAR(64)  UNIQUE NOT NULL,
    uploaded_at  TIMESTAMP DEFAULT NOW(),
    chunk_count  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clinic_settings (
    key   VARCHAR(100) PRIMARY KEY,
    value TEXT DEFAULT ''
);

-- 3. LangChain PGVector tabloları (langchain-postgres paketi ilk çalıştırmada otomatik oluşturur)
--    Aşağıdakiler referans amaçlıdır; elle çalıştırmanıza gerek yoktur.
--
--    CREATE TABLE langchain_pg_collection ( ... )
--    CREATE TABLE langchain_pg_embedding  ( ... )
