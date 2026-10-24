"""
Routes Package.

Exports FastAPI API routers.
"""

from app.routes.modules import router as modules_router
from app.routes.progress import router as progress_router
from app.routes.tutor import router as tutor_router
from app.routes.webhooks import router as webhooks_router

__all__ = [
    "modules_router",
    "progress_router",
    "tutor_router",
    "webhooks_router",
]
