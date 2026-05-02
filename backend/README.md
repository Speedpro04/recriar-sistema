# Backend da Aplicação - Axos Hub SaaS

## Estrutura
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app
│   ├── config.py        # Configurações
│   ├── celery_app.py    # Celery config
│   ├── tasks.py         # Tarefas assíncronas
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Pydantic schemas
│   └── api/             # Endpoints
│       ├── whatsapp.py  # Evolution API integration
│       └── routes.py
├── requirements.txt
├── .env
└── docker-compose.yml
```

## Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute o Docker Compose:
```bash
docker-compose up -d
```

3. Rode o backend:
```bash
uvicorn app.main:app --reload
```

## Serviços

- **Redis**: Filas e cache
- **Celery**: Tarefas assíncronas
- **Evolution API**: Integração WhatsApp
- **PostgreSQL**: Banco de dados
