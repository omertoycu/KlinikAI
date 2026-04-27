import hashlib
import json
import logging
import re

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from supabase.client import Client, create_client

from app.core.config import settings
from app.services.mock_rag import mock_chat

logger = logging.getLogger(__name__)

TABLE_NAME = "document_embeddings"
QUERY_NAME = "match_document_embeddings"

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def _get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def _get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _get_vectorstore() -> SupabaseVectorStore:
    return SupabaseVectorStore(
        client=_get_supabase(),
        embedding=_get_embeddings(),
        table_name=TABLE_NAME,
        query_name=QUERY_NAME,
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
    client = _get_supabase()
    client.table(TABLE_NAME).delete().eq("metadata->>content_hash", content_hash).execute()


SYSTEM_PROMPT = """Sen bir klinik asistanısın. Sadece aşağıdaki bağlam bilgisini kullanarak soruları Türkçe yanıtla.
Randevu talebi algılarsan cevabının sonuna JSON olarak ekle:
<intent>{{"intent": "book_appointment"}}</intent>

Bağlam:
{context}
"""


def _is_mock_mode() -> bool:
    key = settings.groq_api_key
    groq_missing = not key or key.startswith("gsk_your") or "your-key" in key.lower()
    supabase_missing = not settings.supabase_url or not settings.supabase_service_key
    return groq_missing or supabase_missing


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
