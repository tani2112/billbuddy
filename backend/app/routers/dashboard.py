from fastapi import APIRouter
from ..schemas import DashboardStatsResponse
from ..database import get_dashboard_stats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_stats():
    stats = get_dashboard_stats()
    return stats
