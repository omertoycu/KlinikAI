from pydantic import BaseModel


class ChatMessage(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    intent: dict | None = None
