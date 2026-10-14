from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerateListingRequest(BaseModel):
    product_name: str = Field(..., min_length=2, description="Name or title of product")
    category: str = Field(..., min_length=2, description="Product category")
    features_specs: str = Field(..., min_length=5, description="Key features, materials, dimensions, warranty, etc.")
    target_audience: Optional[str] = Field(default="", description="Ideal customer or buyer persona")
    platform: str = Field(default="Instagram", description="Target platform: Instagram, Etsy, eBay, Shopify, Amazon, General")
    tone: str = Field(default="persuasive", description="Tone: professional, friendly, premium, persuasive, playful")
    language: str = Field(default="English", description="Language: English, Hindi, Hinglish")
    image_data: Optional[str] = Field(default=None, description="Base64 encoded data URI of product image")
    model_override: Optional[str] = Field(default=None, description="Optional custom Ollama model to use")

class GeneratedListingData(BaseModel):
    seo_title: str
    description: str
    selling_points: List[str]
    keywords: List[str]
    instagram_caption: str
    call_to_action: str
    alternative_titles: List[str]

class ListingResponse(BaseModel):
    id: str
    product_name: str
    category: str
    features_specs: str
    target_audience: Optional[str] = ""
    platform: str
    tone: str
    language: str
    image_url: Optional[str] = None
    seo_title: str
    description: str
    selling_points: List[str]
    keywords: List[str]
    instagram_caption: str
    call_to_action: str
    alternative_titles: List[str]
    is_saved: bool
    model_used: str
    created_at: str
    updated_at: str

class ListingListItem(BaseModel):
    id: str
    product_name: str
    category: str
    platform: str
    tone: str
    language: str
    seo_title: str
    is_saved: bool
    created_at: str
    image_url: Optional[str] = None

class UpdateListingRequest(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    seo_title: Optional[str] = None
    description: Optional[str] = None
    selling_points: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    instagram_caption: Optional[str] = None
    call_to_action: Optional[str] = None
    alternative_titles: Optional[List[str]] = None
    is_saved: Optional[bool] = None

class SystemHealthResponse(BaseModel):
    status: str  # "healthy", "degraded", "ollama_offline", "model_missing"
    ollama_connected: bool
    ollama_url: str
    active_model: str
    available_models: List[str]
    model_ready: bool
    message: str
    setup_instructions: Dict[str, Any]

class AnalyzeImageRequest(BaseModel):
    image_data: str = Field(..., description="Base64 encoded product photo")
    user_hints: Optional[str] = Field(default="", description="Optional seller notes about the image")

class AnalyzeImageResponse(BaseModel):
    success: bool
    vision_model_used: Optional[str] = None
    detected_features: List[str] = []
    suggested_category: Optional[str] = None
    suggested_colors: List[str] = []
    notes: str = ""

class DashboardStatsResponse(BaseModel):
    total_listings: int
    saved_listings: int
    platform_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
    recent_listings: List[ListingListItem]
