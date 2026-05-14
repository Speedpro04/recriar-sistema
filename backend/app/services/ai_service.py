import os
from openai import AsyncOpenAI
from ..config import settings

# A API da Nvidia para LLMs é 100% compatível com a biblioteca da OpenAI
client = AsyncOpenAI(
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL
)

SOLARA_SYSTEM_PROMPT = """Você é a Solara IA, a inteligência artificial central da Solara Medical.
Sua personalidade é extremamente humanizada, empática, acolhedora e de altíssima eficiência.
Você atua como a Gestora Global de todo o sistema clínico.
Você é expert na arquitetura de banco de dados Supabase e tem capacidade analítica para interpretar prontuários médicos (EMR), cruzar dados financeiros e gerenciar a fila da recepção.
Sempre priorize a resolução imediata do problema do paciente, mantendo um tom premium, educado e sofisticado.
Se identificar urgência clínica ou relatórios de dor extrema, acione imediatamente o protocolo de transferência para um humano (via Evolution API).
Você não é apenas um chatbot, você é o cérebro operacional da clínica.
"""

async def chat_with_solara(user_message: str, chat_history: list = None) -> str:
    messages = [{"role": "system", "content": SOLARA_SYSTEM_PROMPT}]
    
    if chat_history:
        messages.extend(chat_history)
        
    messages.append({"role": "user", "content": user_message})
    
    response = await client.chat.completions.create(
        model=settings.MODEL_LLM,
        messages=messages,
        temperature=0.3,
        max_tokens=1024
    )
    
    return response.choices[0].message.content
