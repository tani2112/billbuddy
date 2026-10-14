import logging
from fastapi import APIRouter, HTTPException, status
from ..schemas import GenerateListingRequest, ListingResponse, AnalyzeImageRequest, AnalyzeImageResponse
from ..services.ollama_service import ollama_service
from ..database import create_listing

logger = logging.getLogger("sellcraft.generate")
router = APIRouter(prefix="/api", tags=["Listing Generator"])

@router.post("/generate", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def generate_product_listing(payload: GenerateListingRequest):
    # 1. Image size validation if provided
    if payload.image_data:
        # Check base64 length (~4/3 of binary size)
        # 5 MB = 5 * 1024 * 1024 = 5,242,880 bytes -> ~7MB base64
        if len(payload.image_data) > 7_500_000:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Uploaded image exceeds 5MB size limit. Please upload a smaller photo."
            )

    # 2. Check if user provided hints from manual description or vision
    image_hints = ""
    if payload.image_data:
        image_hints = "Product photo uploaded by seller."

    # 3. Call Ollama inference
    try:
        generated_data, model_used = await ollama_service.generate_listing(
            product_name=payload.product_name,
            category=payload.category,
            features_specs=payload.features_specs,
            target_audience=payload.target_audience or "",
            platform=payload.platform,
            tone=payload.tone,
            language=payload.language,
            image_hints=image_hints,
            model_override=payload.model_override
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ollama is offline or unreachable: {str(e)}. Please start Ollama via `ollama serve`."
        )
    except TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Generation timed out: {str(e)}. Please try again or use a lighter model."
        )
    except Exception as e:
        logger.error(f"Generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )

    # 4. Save to local SQLite database
    listing = create_listing(
        product_name=payload.product_name,
        category=payload.category,
        features_specs=payload.features_specs,
        target_audience=payload.target_audience or "",
        platform=payload.platform,
        tone=payload.tone,
        language=payload.language,
        image_url=payload.image_data if payload.image_data else None,
        generated_data=generated_data,
        model_used=model_used
    )

    return listing

@router.post("/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_product_image(payload: AnalyzeImageRequest):
    if len(payload.image_data) > 7_500_000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded image exceeds 5MB size limit."
        )

    result = await ollama_service.analyze_image_with_vision_model(
        base64_image=payload.image_data,
        user_hints=payload.user_hints or ""
    )
    return result
