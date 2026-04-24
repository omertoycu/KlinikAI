from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatMessage, ChatResponse
from app.services import rag_service

router = APIRouter(prefix="/chat", tags=["chat"])

# In-memory session history (yeterli başlangıç için)
_sessions: dict[str, list[dict]] = {}


@router.post("/", response_model=ChatResponse)
def chat(body: ChatMessage):
    try:
        history = _sessions.setdefault(body.session_id, [])
        result = rag_service.chat(body.session_id, body.message, history)

        history.append({"role": "user", "content": body.message})
        history.append({"role": "assistant", "content": result["reply"]})
        if len(history) > 20:
            _sessions[body.session_id] = history[-20:]

        return ChatResponse(reply=result["reply"], intent=result.get("intent"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
