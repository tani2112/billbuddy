import pytest
import os
import json
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db, get_connection

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_sellcraft.db")
    monkeypatch.setattr("backend.app.config.settings.DB_PATH", test_db)
    init_db()
    yield

@pytest.fixture
def client():
    return TestClient(app)

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SellCraft API"
    assert "Local Inference" in data["privacy"]

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ollama_connected" in data
    assert "available_models" in data

def test_generate_validation_error(client):
    # Missing required fields
    response = client.post("/api/generate", json={})
    assert response.status_code == 422

def test_generate_and_database_crud(client):
    mock_generated = {
        "seo_title": "Eco-Friendly Bamboo Coffee Tumbler | 500ml Insulated Travel Mug",
        "description": "Start your mornings sustainably with our Bamboo Coffee Tumbler. Featuring double-wall stainless steel insulation encased in organic polished bamboo.",
        "selling_points": [
            "100% Organic Bamboo Exterior with unique wood grain",
            "Double-wall vacuum insulation keeps drinks hot for 8 hours",
            "BPA-free leakproof lid with one-click drink spout",
            "Generous 500ml capacity perfect for cars and backpacks",
            "Eco-friendly gift packaging included"
        ],
        "keywords": ["bamboo tumbler", "travel mug", "eco friendly cup", "insulated coffee flask", "zero waste gift"],
        "instagram_caption": "☕ Say goodbye to single-use cups! Meet our organic Bamboo Tumbler. Tap link in bio to grab yours! #EcoFriendly #CoffeeLover #SustainableLiving",
        "call_to_action": "Order your eco-friendly tumbler today and save 15% on your first order!",
        "alternative_titles": [
            "Handcrafted Bamboo Travel Mug 500ml",
            "Insulated Eco Coffee Tumbler - Stainless Steel Core",
            "Zero Waste Bamboo Drink Flask for Commuters"
        ]
    }

    with patch("backend.app.services.ollama_service.ollama_service.generate_listing", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = (mock_generated, "qwen2.5:1.5b")

        # 1. Create listing
        payload = {
            "product_name": "Bamboo Coffee Tumbler",
            "category": "Home & Living",
            "features_specs": "500ml, double-wall insulation, organic bamboo casing, leakproof lid",
            "target_audience": "Eco-conscious commuters and coffee lovers",
            "platform": "Instagram",
            "tone": "premium",
            "language": "English"
        }
        res = client.post("/api/generate", json=payload)
        assert res.status_code == 201
        item = res.json()
        listing_id = item["id"]
        assert item["product_name"] == "Bamboo Coffee Tumbler"
        assert item["seo_title"] == mock_generated["seo_title"]
        assert len(item["selling_points"]) == 5
        assert item["is_saved"] is False

        # 2. Get listing by ID
        res_get = client.get(f"/api/listings/{listing_id}")
        assert res_get.status_code == 200
        assert res_get.json()["id"] == listing_id

        # 3. Toggle Bookmark / Save
        res_save = client.post(f"/api/listings/{listing_id}/save")
        assert res_save.status_code == 200
        assert res_save.json()["is_saved"] is True

        # 4. Filter listings with saved_only
        res_list = client.get("/api/listings?saved_only=true")
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

        # 5. Search query filter
        res_search = client.get("/api/listings?q=Bamboo")
        assert res_search.status_code == 200
        assert len(res_search.json()) >= 1

        # 6. Update listing
        res_update = client.put(f"/api/listings/{listing_id}", json={
            "seo_title": "Updated Custom Bamboo Mug"
        })
        assert res_update.status_code == 200
        assert res_update.json()["seo_title"] == "Updated Custom Bamboo Mug"

        # 7. Export listing to TXT
        res_export = client.get(f"/api/listings/{listing_id}/export")
        assert res_export.status_code == 200
        assert "text/plain" in res_export.headers["content-type"]
        assert "SELLCRAFT PRODUCT LISTING EXPORT" in res_export.text
        assert "Updated Custom Bamboo Mug" in res_export.text

        # 8. Dashboard stats
        res_stats = client.get("/api/dashboard/stats")
        assert res_stats.status_code == 200
        stats = res_stats.json()
        assert stats["total_listings"] >= 1
        assert stats["saved_listings"] >= 1
        assert "Instagram" in stats["platform_breakdown"]

        # 9. Delete listing
        res_delete = client.delete(f"/api/listings/{listing_id}")
        assert res_delete.status_code == 204

        # Confirm deleted
        res_not_found = client.get(f"/api/listings/{listing_id}")
        assert res_not_found.status_code == 404

def test_ollama_offline_error_handling(client):
    with patch("backend.app.services.ollama_service.ollama_service.generate_listing", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ConnectionError("Connection refused on port 11434")

        payload = {
            "product_name": "Test Mug",
            "category": "Home",
            "features_specs": "Ceramic 300ml microwave safe",
            "platform": "Instagram",
            "tone": "friendly",
            "language": "English"
        }
        res = client.post("/api/generate", json=payload)
        assert res.status_code == 503
        assert "Ollama is offline" in res.json()["detail"]
