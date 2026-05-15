import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("backend/app/.env")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

email = "wineatlas77@gmail.com"

# 1. Obter auth.user
try:
    auth_users = supabase.auth.admin.list_users()
    target_user = next((u for u in auth_users if u.email == email), None)
    
    if not target_user:
        print(f"Usuário auth não encontrado para o email: {email}")
        exit(1)
        
    auth_id = target_user.id
    print(f"Auth ID encontrado: {auth_id}")
    
    # 2. Criar Clínica
    clinic_data = {
        "name": "Clínica Wine Atlas",
        "email": email,
        "subscription_status": "active"
    }
    
    clinic_res = supabase.table("clinics").insert(clinic_data).execute()
    clinic_id = clinic_res.data[0]['id']
    print(f"Clínica criada: {clinic_id}")
    
    # 3. Criar Perfil de Usuário
    user_data = {
        "auth_id": auth_id,
        "clinic_id": clinic_id,
        "full_name": "Dr. Wine Atlas",
        "email": email,
        "role": "admin"
    }
    
    user_res = supabase.table("users").insert(user_data).execute()
    print("Perfil de usuário criado com sucesso!")
    
except Exception as e:
    print(f"Erro: {e}")
