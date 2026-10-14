from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response, status
from ..schemas import ListingResponse, ListingListItem, UpdateListingRequest
from ..database import (
    get_listings,
    get_listing_by_id,
    update_listing,
    toggle_save_listing,
    delete_listing
)

router = APIRouter(prefix="/api/listings", tags=["Listings"])

@router.get("", response_model=List[ListingListItem])
async def list_listings(
    q: Optional[str] = Query(None, description="Search query across title, description, keywords"),
    category: Optional[str] = Query(None, description="Category filter"),
    platform: Optional[str] = Query(None, description="Platform filter"),
    saved_only: bool = Query(False, description="Filter only bookmarked/saved listings"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    items = get_listings(
        query=q,
        category=category,
        platform=platform,
        saved_only=saved_only,
        limit=limit,
        offset=offset
    )
    return items

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_single_listing(listing_id: str):
    item = get_listing_by_id(listing_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return item

@router.put("/{listing_id}", response_model=ListingResponse)
async def update_single_listing(listing_id: str, payload: UpdateListingRequest):
    updates = payload.model_dump(exclude_unset=True)
    updated = update_listing(listing_id, updates)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return updated

@router.post("/{listing_id}/save", response_model=ListingResponse)
async def toggle_save(listing_id: str):
    updated = toggle_save_listing(listing_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return updated

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_single_listing(listing_id: str):
    deleted = delete_listing(listing_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{listing_id}/export")
async def export_listing_as_txt(listing_id: str):
    item = get_listing_by_id(listing_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    points = "\n".join([f"• {p}" for p in item.get("selling_points", [])])
    keywords_list = item.get("keywords", [])
    keywords_str = ", ".join(keywords_list) if isinstance(keywords_list, list) else str(keywords_list)
    alt_titles = "\n".join([f"- {t}" for t in item.get("alternative_titles", [])])

    txt_content = f"""================================================================================
SELLCRAFT PRODUCT LISTING EXPORT
Generated with Open-Source AI ({item.get('model_used', 'Local Model')})
Target Platform: {item.get('platform', 'General')} | Category: {item.get('category', 'General')}
Created: {item.get('created_at', '')}
================================================================================

1. PRIMARY PRODUCT TITLE (SEO OPTIMIZED):
{item.get('seo_title', '')}

--------------------------------------------------------------------------------
2. ALTERNATIVE PRODUCT TITLES:
{alt_titles}

--------------------------------------------------------------------------------
3. PRODUCT DESCRIPTION:
{item.get('description', '')}

--------------------------------------------------------------------------------
4. KEY SELLING POINTS:
{points}

--------------------------------------------------------------------------------
5. CALL TO ACTION:
{item.get('call_to_action', '')}

--------------------------------------------------------------------------------
6. INSTAGRAM CAPTION & HASHTAGS:
{item.get('instagram_caption', '')}

--------------------------------------------------------------------------------
7. SEARCH KEYWORDS & TAGS:
{keywords_str}

================================================================================
Exported from SellCraft — Open-Source AI Listing Generator for Small Business
================================================================================
"""
    clean_filename = f"sellcraft_{item.get('product_name', 'listing').lower().replace(' ', '_')[:30]}.txt"
    return Response(
        content=txt_content,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{clean_filename}"'}
    )
