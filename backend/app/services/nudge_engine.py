"""
Daily Nudge Engine Service.

Responsible for orchestrating daily microlearning notifications, constructing
formatted WhatsApp payloads (containing 3-minute technical quizzes), and firing
webhooks to Make.com and WATI Business API.
"""

import logging
from typing import Any, Dict
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models.module import LearningModule
from app.models.progress import UserProgress
from app.models.user import User

logger = logging.getLogger(__name__)


class DailyNudgeEngine:
    """
    Engine that schedules and dispatches daily microlearning nudges to Make.com and WATI.
    """

    @classmethod
    async def dispatch_daily_nudge(
        cls,
        db: Session,
        user_id: int,
        module_id: int,
    ) -> Dict[str, Any]:
        """
        Dispatches a 3-minute technical quiz nudge via Make.com webhook.

        Args:
            db (Session): Active database session.
            user_id (int): Target learner ID.
            module_id (int): Learning module to extract quiz from.

        Returns:
            Dict[str, Any]: Status of webhook dispatch.
        """
        # Fetch learner and module from database
        user = db.query(User).filter(User.id == user_id).first()
        module = db.query(LearningModule).filter(LearningModule.id == module_id).first()

        if not user or not module:
            logger.error("User %s or Module %s not found for nudge dispatch.", user_id, module_id)
            return {"success": False, "error": "User or Module not found"}

        import json

        try:
            options = json.loads(module.quiz_options)
        except Exception:
            options = ["Option A", "Option B", "Option C", "Option D"]

        # Build payload matching the Make.com / WATI template specification
        payload = {
            "event": "daily_microlearning_nudge",
            "learner_name": user.name,
            "phone_number": user.phone_number,
            "module_code": module.code_id,
            "module_title": module.title,
            "quick_quiz_question": module.quiz_question,
            "quiz_options": options,
            "sandbox_magic_link": f"http://localhost:3000/?module={module.slug}",
            "current_streak": user.streak_count,
        }

        # Attempt HTTP POST to Make.com webhook URL
        webhook_status = 200
        webhook_response = "Simulated webhook delivered"

        if (
            settings.MAKE_WEBHOOK_URL
            and "mock" not in settings.MAKE_WEBHOOK_URL
        ):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        settings.MAKE_WEBHOOK_URL,
                        json=payload,
                    )
                    webhook_status = resp.status_code
                    webhook_response = resp.text
            except Exception as exc:
                logger.warning("Make.com webhook failed to deliver: %s", exc)
                webhook_status = 502
                webhook_response = str(exc)

        # Update UserProgress record to record that the nudge was sent
        progress = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == user.id,
                UserProgress.module_id == module.id,
            )
            .first()
        )

        if not progress:
            progress = UserProgress(
                user_id=user.id,
                module_id=module.id,
                status="in_progress",
                is_nudge_sent=True,
            )
            db.add(progress)
        else:
            progress.is_nudge_sent = True

        db.commit()

        logger.info(
            "Dispatched daily nudge to %s for module %s",
            user.phone_number,
            module.code_id,
        )

        return {
            "success": True,
            "user_id": user.id,
            "phone_number": user.phone_number,
            "webhook_status": webhook_status,
            "webhook_response": webhook_response,
            "payload": payload,
        }
