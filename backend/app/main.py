import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routers import health, generate, listings, dashboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sellcraft")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SellCraft SQLite database...")
    init_db()
    logger.info(f"SellCraft backend started. Ollama target: {settings.OLLAMA_BASE_URL}, Default model: {settings.OLLAMA_MODEL}")
    yield
    logger.info("SellCraft backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Local Open-Source AI Product Listing Generator API for Small Businesses",
    lifespan=lifespan
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(generate.router)
app.include_router(listings.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "app": "SellCraft API",
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "privacy": "100% Local Inference via Ollama. No external cloud AI APIs used."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
