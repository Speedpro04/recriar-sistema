from celery import shared_task
from .config import settings
import httpx

@shared_task
def send_whatsapp_message(phone: str, message: str, clinic_id: str):
    """
    Envia mensagem WhatsApp via Evolution API
    """
    try:
        url = f"{settings.EVOLUTION_API_URL}/message/sendText/{clinic_id}"
        headers = {"apikey": settings.EVOLUTION_API_KEY}
        data = {
            "number": phone,
            "textMessage": {"text": message}
        }
        with httpx.Client() as client:
            response = client.post(url, json=data, headers=headers)
            return response.json()
    except Exception as e:
        return {"error": str(e)}

@shared_task
def send_whatsapp_media(phone: str, media_base64: str, media_type: str, caption: str, clinic_id: str):
    """
    Envia mídia (imagem, áudio, vídeo) via Evolution API
    media_type: 'image', 'audio', 'video', 'document'
    """
    try:
        url = f"{settings.EVOLUTION_API_URL}/message/sendMedia/{clinic_id}"
        headers = {"apikey": settings.EVOLUTION_API_KEY}
        data = {
            "number": phone,
            "mediaMessage": {
                "mediatype": media_type,
                "caption": caption,
                "media": media_base64
            }
        }
        with httpx.Client() as client:
            response = client.post(url, json=data, headers=headers)
            return response.json()
    except Exception as e:
        return {"error": str(e)}

@shared_task
def send_appointment_reminder(appointment_id: str, clinic_id: str):
    """
    Envia lembrete de consulta agendada
    """
    # Buscar dados do agendamento
    # Enviar WhatsApp
    pass

@shared_task
def process_daily_reports(clinic_id: str):
    """
    Processa relatórios diários da clínica
    """
    pass
