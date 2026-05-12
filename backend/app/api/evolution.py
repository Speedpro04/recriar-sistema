from fastapi import APIRouter, Request, BackgroundTasks
from ..tasks import send_whatsapp_message, send_whatsapp_media
import logging

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/evolution")
async def evolution_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Recebe webhooks da Evolution API
    Incluindo mensagens de texto, imagens e áudios em base64
    """
    try:
        data = await request.json()
        logging.info(f"Webhook recebido da Evolution API: {data.get('event')}")
        
        # Aqui o sistema pode processar o evento (ex: MESSAGES_UPSERT)
        # Se for uma imagem ou áudio, o campo 'base64' estará presente se ativado
        
        return {"status": "success", "message": "Webhook processed"}
    except Exception as e:
        logging.error(f"Erro ao processar webhook da Evolution API: {str(e)}")
        return {"status": "error", "message": str(e)}
