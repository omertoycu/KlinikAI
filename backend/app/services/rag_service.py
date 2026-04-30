import hashlib
import json
import logging
import re

from langchain_community.document_loaders import PyPDFLoader
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres.vectorstores import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import text

from app.core.config import settings
from app.services.mock_rag import mock_chat

logger = logging.getLogger(__name__)

COLLECTION_NAME = "document_embeddings"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def _get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def _get_vectorstore() -> PGVector:
    return PGVector(
        embeddings=_get_embeddings(),
        collection_name=COLLECTION_NAME,
        connection=settings.database_url,
        use_jsonb=True,
    )


def ingest_pdf(file_path: str) -> tuple[str, int]:
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    content = "".join(d.page_content for d in docs)
    content_hash = hashlib.sha256(content.encode()).hexdigest()

    for chunk in chunks:
        chunk.metadata["content_hash"] = content_hash

    vs = _get_vectorstore()
    vs.add_documents(chunks)

    return content_hash, len(chunks)


def delete_document_chunks(content_hash: str) -> None:
    from app.core.database import engine

    with engine.connect() as conn:
        conn.execute(
            text(
                "DELETE FROM langchain_pg_embedding "
                "WHERE cmetadata->>'content_hash' = :h"
            ),
            {"h": content_hash},
        )
        conn.commit()


SYSTEM_PROMPT = """Sen bir klinik asistanısın. Sadece aşağıdaki bağlam bilgisini kullanarak soruları Türkçe yanıtla.
Randevu talebi algılarsan cevabının sonuna JSON olarak ekle:
<intent>{{"intent": "book_appointment"}}</intent>

Bağlam:
{context}
"""


def _is_mock_mode() -> bool:
    key = settings.groq_api_key
    return not key or key.startswith("gsk_your") or "your-key" in key.lower()


def chat(session_id: str, message: str, history: list[dict]) -> dict:
    if _is_mock_mode():
        return mock_chat(message)

    try:
        vs = _get_vectorstore()
        docs = vs.similarity_search(message, k=4)
        context = "\n\n".join(d.page_content for d in docs)
    except Exception as exc:
        logger.warning("RAG vector search failed, falling back to mock: %s", exc)
        return mock_chat(message)

    try:
        llm = ChatGroq(
            model=settings.groq_model,
            groq_api_key=settings.groq_api_key,
            temperature=0.3,
        )

        messages = [{"role": "system", "content": SYSTEM_PROMPT.format(context=context)}]
        for h in history[-6:]:
            messages.append(h)
        messages.append({"role": "user", "content": message})

        response = llm.invoke(messages)
        reply_text: str = response.content

        intent = None
        match = re.search(r"<intent>(.*?)</intent>", reply_text, re.DOTALL)
        if match:
            try:
                intent = json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
            reply_text = re.sub(r"<intent>.*?</intent>", "", reply_text, flags=re.DOTALL).strip()

        return {"reply": reply_text, "intent": intent}
    except Exception as exc:
        logger.warning("LLM call failed, falling back to mock: %s", exc)
        return mock_chat(message)
