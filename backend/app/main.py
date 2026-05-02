from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .celery_app import celery_app

app = FastAPI(
    title="Axos Hub API",
    description="API para Gestão de Clínicas Médicas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Axos Hub API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "redis": "connected", "celery": "connected"}

@app.get("/api/clinics")
async def list_clinics():
    return {"clinics": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
