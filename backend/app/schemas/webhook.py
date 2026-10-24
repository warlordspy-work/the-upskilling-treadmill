"""
Integration and Webhook Schemas.

Defines payloads exchanged with Make.com automation scenarios,
WATI WhatsApp Business API, and Razorpay subscription webhooks.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class MakeNudgeTriggerRequest(BaseModel):
    """Payload sent by scheduler to trigger Make.com daily nudge automation."""

    user_id: int
    module_id: int


class MakeWebhookPayload(BaseModel):
    """Payload dispatched to Make.com containing WhatsApp template variables."""

    event: str = "daily_microlearning_nudge"
    learner_name: str
    phone_number: str
    module_code: str
    module_title: str
    quick_quiz_question: str
    quiz_options: list[str]
    sandbox_magic_link: str
    current_streak: int


class WatiMessageRequest(BaseModel):
    """Direct WATI WhatsApp template message request schema."""

    phone_number: str
    template_name: str = "devsync_daily_nudge"
    parameters: list[dict[str, str]] = Field(default_factory=list)


class RazorpayWebhookPayload(BaseModel):
    """Razorpay subscription payment event webhook schema."""

    event: str
    account_id: str
    payload: dict[str, Any]
