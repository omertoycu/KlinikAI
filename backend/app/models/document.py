from sqlalchemy import Column, DateTime, Integer, String, func
from app.core.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500), nullable=False)
    content_hash = Column(String(64), unique=True, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())
    chunk_count = Column(Integer, default=0)
