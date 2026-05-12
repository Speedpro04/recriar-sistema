from fastapi import APIRouter, HTTPException, Depends
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY")

@router.get("/status/{instance_name}")
async def get_status(instance_name: str):
    """
    Verifica o status da instância na Evolution API
    """
    url = f"{EVOLUTION_API_URL}/instance/connectionStatus/{instance_name}"
    headers = {"apikey": EVOLUTION_API_KEY}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/connect/{instance_name}")
async def connect_instance(instance_name: str):
    """
    Cria a instância se não existir e retorna o QR Code
    """
    # 1. Tenta criar a instância (ignora se já existir)
    create_url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {"apikey": EVOLUTION_API_KEY}
    payload = {
        "instanceName": instance_name,
        "token": instance_name, # Usando o nome como token simplificado
        "qrcode": True
    }
    
    async with httpx.AsyncClient() as client:
        await client.post(create_url, headers=headers, json=payload)
        
        # 2. Busca o QR Code / Status de conexão
        connect_url = f"{EVOLUTION_API_URL}/instance/connect/{instance_name}"
        response = await client.get(connect_url, headers=headers)
        return response.json()

@router.post("/logout/{instance_name}")
async def logout_instance(instance_name: str):
    """
    Desconecta o WhatsApp da instância
    """
    url = f"{EVOLUTION_API_URL}/instance/logout/{instance_name}"
    headers = {"apikey": EVOLUTION_API_KEY}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(url, headers=headers)
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
