import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import verify_admin as verify_token
from app.models.document import KnowledgeDocument
from app.services import rag_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    _: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyaları desteklenmektedir")

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        content_hash, chunk_count = rag_service.ingest_pdf(tmp_path)
        os.unlink(tmp_path)

        existing = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.content_hash == content_hash
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Bu belge zaten yüklü")

        doc = KnowledgeDocument(
            filename=file.filename,
            content_hash=content_hash,
            chunk_count=chunk_count,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return {"id": doc.id, "filename": doc.filename, "chunk_count": doc.chunk_count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
def list_documents(_: str = Depends(verify_token), db: Session = Depends(get_db)):
    try:
        docs = (
            db.query(KnowledgeDocument)
            .order_by(KnowledgeDocument.uploaded_at.desc())
            .all()
        )
        return [
            {
                "id": d.id,
                "filename": d.filename,
                "uploaded_at": d.uploaded_at,
                "chunk_count": d.chunk_count or 0,
            }
            for d in docs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/{doc_id}", status_code=204)
def delete_document(
    doc_id: int, _: str = Depends(verify_token), db: Session = Depends(get_db)
):
    try:
        doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Belge bulunamadı")

        content_hash = doc.content_hash
        db.delete(doc)
        db.commit()

        try:
            rag_service.delete_document_chunks(content_hash)
        except Exception:
            pass
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
