import sqlite3
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from .config import settings

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    try:
        with conn:
            conn.execute("""
            CREATE TABLE IF NOT EXISTS listings (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                category TEXT NOT NULL,
                features_specs TEXT NOT NULL,
                target_audience TEXT DEFAULT '',
                platform TEXT NOT NULL,
                tone TEXT NOT NULL,
                language TEXT NOT NULL,
                image_url TEXT,
                seo_title TEXT NOT NULL,
                description TEXT NOT NULL,
                selling_points TEXT NOT NULL,
                keywords TEXT NOT NULL,
                instagram_caption TEXT NOT NULL,
                call_to_action TEXT NOT NULL,
                alternative_titles TEXT NOT NULL,
                is_saved INTEGER DEFAULT 0,
                model_used TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_is_saved ON listings(is_saved);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_platform ON listings(platform);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);")
    finally:
        conn.close()

def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    d = dict(row)
    d["is_saved"] = bool(d["is_saved"])
    try:
        d["selling_points"] = json.loads(d["selling_points"]) if isinstance(d["selling_points"], str) else d["selling_points"]
    except Exception:
        d["selling_points"] = [d["selling_points"]] if d["selling_points"] else []
        
    try:
        d["keywords"] = json.loads(d["keywords"]) if isinstance(d["keywords"], str) else d["keywords"]
    except Exception:
        d["keywords"] = [k.strip() for k in str(d["keywords"]).split(",") if k.strip()]
        
    try:
        d["alternative_titles"] = json.loads(d["alternative_titles"]) if isinstance(d["alternative_titles"], str) else d["alternative_titles"]
    except Exception:
        d["alternative_titles"] = [d["alternative_titles"]] if d["alternative_titles"] else []
        
    return d

def create_listing(
    product_name: str,
    category: str,
    features_specs: str,
    target_audience: str,
    platform: str,
    tone: str,
    language: str,
    image_url: Optional[str],
    generated_data: Dict[str, Any],
    model_used: str
) -> Dict[str, Any]:
    listing_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    conn = get_connection()
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO listings (
                    id, product_name, category, features_specs, target_audience,
                    platform, tone, language, image_url, seo_title, description,
                    selling_points, keywords, instagram_caption, call_to_action,
                    alternative_titles, is_saved, model_used, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
                """,
                (
                    listing_id,
                    product_name,
                    category,
                    features_specs,
                    target_audience or "",
                    platform,
                    tone,
                    language,
                    image_url,
                    generated_data.get("seo_title", ""),
                    generated_data.get("description", ""),
                    json.dumps(generated_data.get("selling_points", [])),
                    json.dumps(generated_data.get("keywords", [])),
                    generated_data.get("instagram_caption", ""),
                    generated_data.get("call_to_action", ""),
                    json.dumps(generated_data.get("alternative_titles", [])),
                    model_used,
                    now,
                    now
                )
            )
        return get_listing_by_id(listing_id)
    finally:
        conn.close()

def get_listing_by_id(listing_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
        row = cur.fetchone()
        if not row:
            return None
        return _row_to_dict(row)
    finally:
        conn.close()

def get_listings(
    query: Optional[str] = None,
    category: Optional[str] = None,
    platform: Optional[str] = None,
    saved_only: bool = False,
    limit: int = 50,
    offset: int = 0
) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        conditions = []
        params = []
        
        if query:
            conditions.append("(product_name LIKE ? OR seo_title LIKE ? OR description LIKE ? OR keywords LIKE ?)")
            q = f"%{query.strip()}%"
            params.extend([q, q, q, q])
            
        if category and category.lower() != "all":
            conditions.append("LOWER(category) = LOWER(?)")
            params.append(category.strip())
            
        if platform and platform.lower() != "all":
            conditions.append("LOWER(platform) = LOWER(?)")
            params.append(platform.strip())
            
        if saved_only:
            conditions.append("is_saved = 1")
            
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"""
            SELECT id, product_name, category, platform, tone, language, seo_title, is_saved, created_at, image_url
            FROM listings
            {where_clause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])
        cur.execute(sql, params)
        rows = cur.fetchall()
        
        result = []
        for r in rows:
            d = dict(r)
            d["is_saved"] = bool(d["is_saved"])
            result.append(d)
        return result
    finally:
        conn.close()

def update_listing(listing_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM listings WHERE id = ?", (listing_id,))
        if not cur.fetchone():
            return None
            
        now = datetime.now(timezone.utc).isoformat()
        fields = ["updated_at = ?"]
        params = [now]
        
        for key, val in updates.items():
            if val is None:
                continue
            if key in ["selling_points", "keywords", "alternative_titles"] and isinstance(val, list):
                fields.append(f"{key} = ?")
                params.append(json.dumps(val))
            elif key == "is_saved":
                fields.append("is_saved = ?")
                params.append(1 if val else 0)
            elif key in ["product_name", "category", "seo_title", "description", "instagram_caption", "call_to_action"]:
                fields.append(f"{key} = ?")
                params.append(val)
                
        params.append(listing_id)
        sql = f"UPDATE listings SET {', '.join(fields)} WHERE id = ?"
        
        with conn:
            conn.execute(sql, params)
            
        return get_listing_by_id(listing_id)
    finally:
        conn.close()

def toggle_save_listing(listing_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT is_saved FROM listings WHERE id = ?", (listing_id,))
        row = cur.fetchone()
        if not row:
            return None
        new_val = 0 if row["is_saved"] else 1
        now = datetime.now(timezone.utc).isoformat()
        with conn:
            conn.execute("UPDATE listings SET is_saved = ?, updated_at = ? WHERE id = ?", (new_val, now, listing_id))
        return get_listing_by_id(listing_id)
    finally:
        conn.close()

def delete_listing(listing_id: str) -> bool:
    conn = get_connection()
    try:
        with conn:
            cur = conn.execute("DELETE FROM listings WHERE id = ?", (listing_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

def get_dashboard_stats() -> Dict[str, Any]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS total FROM listings")
        total = cur.fetchone()["total"]
        
        cur.execute("SELECT COUNT(*) AS saved FROM listings WHERE is_saved = 1")
        saved = cur.fetchone()["saved"]
        
        cur.execute("SELECT platform, COUNT(*) AS cnt FROM listings GROUP BY platform")
        platforms = {r["platform"]: r["cnt"] for r in cur.fetchall()}
        
        cur.execute("SELECT category, COUNT(*) AS cnt FROM listings GROUP BY category")
        categories = {r["category"]: r["cnt"] for r in cur.fetchall()}
        
        recent = get_listings(limit=6)
        
        return {
            "total_listings": total,
            "saved_listings": saved,
            "platform_breakdown": platforms,
            "category_breakdown": categories,
            "recent_listings": recent
        }
    finally:
        conn.close()
