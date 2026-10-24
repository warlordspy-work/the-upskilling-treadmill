"""
Webhooks and Integrations API Routes.

Connects with Make.com for WhatsApp automated nudges, WATI Business API,
and Razorpay subscription webhook handling.
"""

import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.module import LearningModule
from app.models.progress import UserProgress
from app.schemas.webhook import MakeNudgeTriggerRequest, RazorpayWebhookPayload
from app.services.nudge_engine import DailyNudgeEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["Integrations & Webhooks"])


@router.post("/trigger-daily-nudge")
async def trigger_daily_nudge(
    payload: MakeNudgeTriggerRequest,
    db: Session = Depends(get_db),
):
    """
    Triggers the Make.com workflow scenario to deliver a WhatsApp microlearning nudge.
    """
    result = await DailyNudgeEngine.dispatch_daily_nudge(
        db=db,
        user_id=payload.user_id,
        module_id=payload.module_id,
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to dispatch daily nudge."),
        )

    return {
        "status": "dispatched",
        "message": "Daily nudge webhook successfully dispatched to Make.com / WATI.",
        "details": result,
    }


@router.post("/make-quiz-response")
def receive_make_whatsapp_response(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """
    Callback webhook invoked by Make.com when a user replies to the WhatsApp quiz.
    """
    phone_number = payload.get("phone_number")
    module_code = payload.get("module_code")
    selected_option = payload.get("selected_option")  # 0, 1, 2, or 3

    if not phone_number or not module_code:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="phone_number and module_code are required fields.",
        )

    user = db.query(User).filter(User.phone_number == phone_number).first()
    module = (
        db.query(LearningModule)
        .filter(LearningModule.code_id == module_code)
        .first()
    )

    if not user or not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or Module not located for WhatsApp reply.",
        )

    try:
        selected_idx = int(selected_option)
    except (ValueError, TypeError):
        selected_idx = -1

    is_correct = selected_idx == module.quiz_correct_index

    if is_correct:
        user.streak_count += 1

    # Record progress
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user.id,
            UserProgress.module_id == module.id,
        )
        .first()
    )

    if progress:
        progress.quiz_answered = True
        progress.quiz_selected_index = selected_idx
        progress.quiz_is_correct = is_correct

    db.commit()

    return {
        "status": "processed",
        "is_correct": is_correct,
        "streak_count": user.streak_count,
        "explanation": module.quiz_explanation,
    }


@router.post("/razorpay")
def handle_razorpay_webhook(
    payload: RazorpayWebhookPayload,
    db: Session = Depends(get_db),
):
    """
    Handles Razorpay subscription payment events to grant premium tier access.
    """
    event = payload.event
    logger.info("Received Razorpay webhook event: %s", event)

    if event in ("subscription.charged", "payment.captured"):
        payment_entity = payload.payload.get("payment", {}).get("entity", {})
        customer_email = payment_entity.get("email")

        if customer_email:
            user = db.query(User).filter(User.email == customer_email).first()
            if user:
                user.subscription_tier = "pro"
                db.commit()
                logger.info("Upgraded user %s to pro subscription tier.", user.email)

    return {"status": "ok", "event_received": event}
