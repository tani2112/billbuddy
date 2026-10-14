from fastapi import APIRouter
from ..schemas import SystemHealthResponse
from ..services.ollama_service import ollama_service

router = APIRouter(prefix="/api", tags=["System Health"])

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health():
    health_data = await ollama_service.check_health()
    return health_data

@router.get("/models")
async def get_installed_models():
    models = await ollama_service.get_available_models()
    return {"models": models, "active": ollama_service.default_model}
