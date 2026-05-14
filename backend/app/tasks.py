from celery import shared_task
from .config import settings
from .services.supabase_service import supabase_client
import httpx
from datetime import datetime, timedelta

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
    Envia lembrete de consulta agendada via WhatsApp
    """
    try:
        # 1. Buscar dados do agendamento, paciente e clínica
        response = supabase_client.table("appointments").select("*, patients(*), clinics(*)").eq("id", appointment_id).single().execute()
        
        if not response.data:
            return {"error": "Agendamento não encontrado"}
            
        appointment = response.data
        patient = appointment.get("patients")
        clinic = appointment.get("clinics")
        
        if not patient or not patient.get("phone"):
            return {"error": "Paciente sem telefone cadastrado"}

        # 2. Formatar mensagem humanizada (Estilo Solara IA)
        message = f"Olá, {patient['name']}! 🌟\n\nAqui é da clínica {clinic['name']}. Passando para confirmar sua consulta agendada para amanhã, às {appointment['start_time'][11:16]}.\n\nPodemos confirmar sua presença? Basta responder 'Sim' ou 'Não'."

        # 3. Enviar via Evolution API
        return send_whatsapp_message(patient['phone'], message, clinic_id)
        
    except Exception as e:
        return {"error": str(e)}

@shared_task
def process_daily_reports(clinic_id: str):
    """
    Processa relatórios diários da clínica (ex: total de agendamentos, no-shows)
    """
    try:
        today = datetime.now().date().isoformat()
        response = supabase_client.table("appointments").select("*").eq("clinic_id", clinic_id).gte("start_time", today).execute()
        
        # Lógica de sumarização com Polars (como sugerido no main.py)
        # Por enquanto, apenas retorna o count
        return {
            "clinic_id": clinic_id,
            "date": today,
            "total_appointments": len(response.data) if response.data else 0
        }
    except Exception as e:
        return {"error": str(e)}
