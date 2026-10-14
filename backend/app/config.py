import os
import socket

def detect_ollama_port() -> str:
    explicit = os.getenv("OLLAMA_BASE_URL")
    if explicit:
        return explicit

    # Test if 11435 is open first
    for port in [11435, 11434]:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.3)
                if s.connect_ex(("127.0.0.1", port)) == 0:
                    return f"http://localhost:{port}"
        except Exception:
            pass

    return "http://localhost:11434"

class Settings:
    PROJECT_NAME: str = "SellCraft API"
    VERSION: str = "1.0.0"
    
    # Ollama settings (auto-detected port 11435 or 11434)
    OLLAMA_BASE_URL: str = detect_ollama_port()
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")
    OLLAMA_VISION_MODEL: str = os.getenv("OLLAMA_VISION_MODEL", "llama3.2-vision:latest")
    OLLAMA_TIMEOUT: float = float(os.getenv("OLLAMA_TIMEOUT", "120.0"))
    
    # SQLite Database
    DB_PATH: str = os.getenv("DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sellcraft.db"))
    
    # Max image upload limit in MB
    MAX_IMAGE_SIZE_MB: int = 5

settings = Settings()
