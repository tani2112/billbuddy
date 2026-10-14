from __future__ import annotations
import httpx
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from ..config import settings
from .prompt_builder import build_listing_system_prompt, build_listing_user_prompt

logger = logging.getLogger("sellcraft.ollama")

VISION_MODEL_CANDIDATES = [
    "llama3.2-vision:latest",
    "llama3.2-vision:11b",
    "llava:latest",
    "llava:7b",
    "llava:13b",
    "qwen2-vl:latest",
    "qwen2-vl:7b",
    "bakllava:latest",
    "minicpm-v:latest"
]

class OllamaService:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, default_model: str = settings.OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = settings.OLLAMA_TIMEOUT
        self._candidate_urls = list(dict.fromkeys([
            self.base_url,
            "http://localhost:11435",
            "http://localhost:11434",
            "http://127.0.0.1:11435",
            "http://127.0.0.1:11434"
        ]))

    async def _resolve_working_url(self) -> Optional[str]:
        """Check configured and fallback ports to locate active Ollama daemon."""
        for url in self._candidate_urls:
            try:
                async with httpx.AsyncClient(timeout=1.5) as client:
                    res = await client.get(f"{url}/api/tags")
                    if res.status_code == 200:
                        self.base_url = url
                        return url
            except Exception:
                continue
        return None

    async def get_available_models(self) -> List[str]:
        """Fetch list of locally installed models from Ollama."""
        working_url = await self._resolve_working_url()
        target_url = working_url or self.base_url
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(f"{target_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", []) if m.get("name")]
                    return models
                return []
        except Exception as e:
            logger.warning(f"Failed to query Ollama tags: {e}")
            return []

    async def check_health(self) -> Dict[str, Any]:
        """Perform deep health inspection on Ollama service and models."""
        working_url = await self._resolve_working_url()
        if not working_url:
            return {
                "status": "ollama_offline",
                "ollama_connected": False,
                "ollama_url": self.base_url,
                "active_model": self.default_model,
                "available_models": [],
                "model_ready": False,
                "message": f"Could not connect to Ollama at {self.base_url}. Ensure Ollama daemon is running.",
                "setup_instructions": self._get_setup_instructions()
            }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(f"{working_url}/api/tags")
                if res.status_code != 200:
                    return {
                        "status": "degraded",
                        "ollama_connected": True,
                        "ollama_url": working_url,
                        "active_model": self.default_model,
                        "available_models": [],
                        "model_ready": False,
                        "message": f"Ollama returned HTTP {res.status_code}",
                        "setup_instructions": self._get_setup_instructions()
                    }
                
                data = res.json()
                models = [m.get("name") for m in data.get("models", []) if m.get("name")]
                
                model_ready = False
                active_model = self.default_model
                
                if any(active_model == m or active_model.split(":")[0] == m.split(":")[0] for m in models):
                    model_ready = True
                elif models:
                    active_model = models[0]
                    model_ready = True

                status = "healthy" if model_ready else "model_missing"
                message = "Ollama is running and models are ready." if model_ready else (
                    f"Ollama is running, but configured model '{self.default_model}' is not pulled yet."
                    if not models else "Available models detected."
                )

                return {
                    "status": status,
                    "ollama_connected": True,
                    "ollama_url": working_url,
                    "active_model": active_model,
                    "available_models": models,
                    "model_ready": model_ready,
                    "message": message,
                    "setup_instructions": self._get_setup_instructions()
                }

        except Exception as e:
            return {
                "status": "ollama_offline",
                "ollama_connected": False,
                "ollama_url": self.base_url,
                "active_model": self.default_model,
                "available_models": [],
                "model_ready": False,
                "message": f"Error reaching Ollama: {str(e)}",
                "setup_instructions": self._get_setup_instructions()
            }

    def _get_setup_instructions(self) -> Dict[str, Any]:
        return {
            "install_linux": "curl -fsSL https://ollama.com/install.sh | sh",
            "start_service": "ollama serve",
            "pull_qwen": "ollama pull qwen2.5:1.5b",
            "pull_vision": "ollama pull llama3.2-vision:latest",
            "recommended_models": [
                {"name": "qwen2.5:1.5b", "size": "986 MB", "desc": "Fast, lightweight, great multilingual performance"},
                {"name": "qwen2.5:3b", "size": "1.9 GB", "desc": "Optimal balance of speed and copy nuance"},
                {"name": "llama3.2:latest", "size": "2.0 GB", "desc": "Meta's open 3B parameter model"},
                {"name": "llama3.2-vision:latest", "size": "7.9 GB", "desc": "Open vision model for direct image inspection"}
            ]
        }

    async def get_active_model_to_use(self, requested_model: Optional[str] = None) -> Tuple[str, bool]:
        """Determine which model to run inference with."""
        models = await self.get_available_models()
        if not models:
            return self.default_model, False

        if requested_model and requested_model in models:
            return requested_model, True

        if self.default_model in models:
            return self.default_model, True

        for m in models:
            if "qwen" in m.lower():
                return m, True

        return models[0], True

    async def generate_listing(
        self,
        product_name: str,
        category: str,
        features_specs: str,
        target_audience: str,
        platform: str,
        tone: str,
        language: str,
        image_hints: str = "",
        model_override: Optional[str] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        Generate complete listing via Ollama local inference.
        Returns: (parsed_json_dict, model_name)
        """
        working_url = await self._resolve_working_url()
        target_url = working_url or self.base_url

        model_to_use, is_available = await self.get_active_model_to_use(model_override)
        if not is_available:
            raise RuntimeError(
                f"No suitable open-source model found in Ollama. "
                f"Please run `ollama pull {self.default_model}`."
            )

        system_prompt = build_listing_system_prompt()
        user_prompt = build_listing_user_prompt(
            product_name=product_name,
            category=category,
            features_specs=features_specs,
            target_audience=target_audience,
            platform=platform,
            tone=tone,
            language=language,
            image_hints=image_hints
        )

        payload = {
            "model": model_to_use,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 1500
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{target_url}/api/chat", json=payload)
                if res.status_code != 200:
                    err_msg = res.text
                    raise RuntimeError(f"Ollama generation failed (HTTP {res.status_code}): {err_msg}")
                
                data = res.json()
                raw_content = data.get("message", {}).get("content", "")
                parsed = self._clean_and_parse_json(raw_content)
                self._validate_generated_structure(parsed)
                return parsed, model_to_use

        except httpx.ConnectError:
            raise ConnectionError(
                f"Cannot connect to Ollama at {target_url}. Ensure Ollama is running via `ollama serve`."
            )
        except httpx.TimeoutException:
            raise TimeoutError(
                f"Ollama generation timed out after {self.timeout}s. Your system may be under heavy load."
            )

    async def analyze_image_with_vision_model(self, base64_image: str, user_hints: str = "") -> Dict[str, Any]:
        """
        If a vision model is installed locally in Ollama, inspect visible product characteristics.
        Otherwise return graceful guidance for manual description.
        """
        working_url = await self._resolve_working_url()
        target_url = working_url or self.base_url

        models = await self.get_available_models()
        vision_model = None
        for candidate in VISION_MODEL_CANDIDATES:
            if candidate in models:
                vision_model = candidate
                break

        if not vision_model:
            return {
                "success": False,
                "vision_model_used": None,
                "detected_features": [],
                "suggested_category": None,
                "suggested_colors": [],
                "notes": (
                    "No vision model (e.g. llama3.2-vision, llava) is currently installed in Ollama. "
                    "You can enter product specifications manually, or run `ollama pull llama3.2-vision:latest` "
                    "for automatic visual feature extraction."
                )
            }

        clean_b64 = base64_image
        if "base64," in clean_b64:
            clean_b64 = clean_b64.split("base64,")[1]

        prompt = """Examine this product photo and extract only verifiable visual details.
Respond in valid JSON format:
{
  "detected_features": ["feature 1", "feature 2", "feature 3"],
  "suggested_category": "Category name",
  "suggested_colors": ["Color 1", "Color 2"],
  "notes": "Short summary of visible materials, style, condition, or patterns."
}
Never invent details, brand names, or specifications not directly visible in the image."""

        payload = {
            "model": vision_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "images": [clean_b64]
                }
            ],
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                res = await client.post(f"{target_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "")
                    parsed = self._clean_and_parse_json(content)
                    return {
                        "success": True,
                        "vision_model_used": vision_model,
                        "detected_features": parsed.get("detected_features", []),
                        "suggested_category": parsed.get("suggested_category"),
                        "suggested_colors": parsed.get("suggested_colors", []),
                        "notes": parsed.get("notes", "Successfully analyzed visible attributes.")
                    }
        except Exception as e:
            logger.warning(f"Vision model analysis failed: {e}")

        return {
            "success": False,
            "vision_model_used": vision_model,
            "detected_features": [],
            "suggested_category": None,
            "suggested_colors": [],
            "notes": "Vision model was reached but could not process image. Please enter details manually."
        }

    def _clean_and_parse_json(self, raw: str) -> Dict[str, Any]:
        """Strip markdown fences, leading/trailing whitespace and parse JSON."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if len(lines) > 2 and lines[-1].strip().startswith("```"):
                cleaned = "\n".join(lines[1:-1]).strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r'(\{[\s\S]*\})', cleaned)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            raise ValueError(f"Could not parse valid JSON from model response: {cleaned[:200]}...")

    def _validate_generated_structure(self, data: Dict[str, Any]):
        """Ensure all required fields exist and have proper defaults."""
        if not data.get("seo_title"):
            data["seo_title"] = "Product Listing"
        if not data.get("description"):
            data["description"] = "High quality product crafted with attention to detail."
        
        sp = data.get("selling_points", [])
        if not isinstance(sp, list) or len(sp) == 0:
            data["selling_points"] = [
                "Premium quality construction and durable finish",
                "Ergonomic, modern design tailored for everyday convenience",
                "Versatile style suited for multiple occasions",
                "Exceptional value with high customer satisfaction",
                "Fast, reliable fulfillment and dedicated support"
            ]
        elif len(sp) < 5:
            while len(data["selling_points"]) < 5:
                data["selling_points"].append("Guaranteed craftsmanship and customer satisfaction")
        elif len(sp) > 5:
            data["selling_points"] = data["selling_points"][:5]

        kw = data.get("keywords", [])
        if not isinstance(kw, list) or len(kw) == 0:
            data["keywords"] = ["premium quality", "bestseller", "trending", "must have", "shop now"]

        if not data.get("instagram_caption"):
            data["instagram_caption"] = f"✨ Elevate your everyday style with our latest favorite! Tap the link in bio to shop. #ShopSmall #Trending #Quality"

        if not data.get("call_to_action"):
            data["call_to_action"] = "Order yours today while stocks last!"

        alt = data.get("alternative_titles", [])
        if not isinstance(alt, list) or len(alt) < 3:
            base = data.get("seo_title", "Product")
            data["alternative_titles"] = [
                f"Premium {base} - Bestseller Edition",
                f"Handcrafted {base} | Modern Style",
                f"Essential {base} for Everyday Use"
            ]

ollama_service = OllamaService()
