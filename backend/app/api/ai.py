from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.ai_service import chat_with_solara

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatRequest(BaseModel):
    message: str
    phone: str = None  # Telefone opcional para contexto futuro

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint para interagir com a Solara IA
    """
    try:
        response_text = await chat_with_solara(request.message)
        return {
            "status": "success",
            "solara_response": response_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")
