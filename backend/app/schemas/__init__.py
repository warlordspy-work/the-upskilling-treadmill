"""
Pydantic Schemas Package.

Exports data validation schemas for Users, Modules, Progress, Webhooks, and AI Tutor.
"""

from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.module import (
    FileItem,
    AssertionItem,
    ModuleListItem,
    ModuleDetailResponse,
    CodeExecutionRequest,
    CodeExecutionResponse,
)
from app.schemas.progress import (
    ProgressUpdate,
    ProgressResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from app.schemas.webhook import (
    MakeNudgeTriggerRequest,
    MakeWebhookPayload,
    WatiMessageRequest,
    RazorpayWebhookPayload,
)
from app.schemas.tutor import TutorQueryRequest, TutorQueryResponse

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "FileItem",
    "AssertionItem",
    "ModuleListItem",
    "ModuleDetailResponse",
    "CodeExecutionRequest",
    "CodeExecutionResponse",
    "ProgressUpdate",
    "ProgressResponse",
    "QuizSubmitRequest",
    "QuizSubmitResponse",
    "MakeNudgeTriggerRequest",
    "MakeWebhookPayload",
    "WatiMessageRequest",
    "RazorpayWebhookPayload",
    "TutorQueryRequest",
    "TutorQueryResponse",
]
