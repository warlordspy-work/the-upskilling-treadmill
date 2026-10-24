"""
In-Flow AI Tutor API Routes.

Provides contextual technical guidance for learners working through
corporate briefs and code sandboxes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.module import LearningModule
from app.schemas.tutor import TutorQueryRequest, TutorQueryResponse

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])


@router.post("/query", response_model=TutorQueryResponse)
def query_ai_tutor(
    payload: TutorQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Evaluates contextual questions asked by the learner about the active lesson.
    """
    module = (
        db.query(LearningModule)
        .filter(LearningModule.id == payload.module_id)
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module ID {payload.module_id} not found.",
        )

    query_lower = payload.user_query.lower()

    # Contextual heuristics tailored to Cloud Run & Next.js briefs
    if "port" in query_lower or "3000" in query_lower or "8080" in query_lower or "line 18" in query_lower:
        response_text = (
            "Cloud Run defaults to listening on **PORT 8080**. If your container maps 3000 "
            "in your Dockerfile without setting the `PORT` environment variable, Cloud Run's health probe "
            "fails with a 502 Bad Gateway. Updating line 18 in `service.yaml` to "
            "`containerPort: 8080` resolves this contract mismatch immediately."
        )
        suggested = [
            "Explain containerConcurrency",
            "Show Dockerfile Best Practices",
            "Why does Cloud Run scale to zero?",
        ]
        code_fix = "containerPort: 8080"

    elif "memory" in query_lower or "limit" in query_lower or "concurrency" in query_lower:
        response_text = (
            "Under sudden traffic bursts, Node.js applications risk memory pressure. "
            "Configuring `memory: 512Mi` along with `containerConcurrency: 80` guarantees "
            "the container handles up to 80 simultaneous requests before Cloud Run spins up a "
            "fresh instance, avoiding out-of-memory container crashes."
        )
        suggested = [
            "What is Knative autoscaling?",
            "How to eliminate cold starts?",
            "Run Assertion Checks",
        ]
        code_fix = "resources:\n  limits:\n    memory: 512Mi\n    cpu: \"1000m\""

    elif "best practice" in query_lower or "practice" in query_lower:
        response_text = (
            "**Cloud Run Production Best Practices:**\n"
            "1. Multi-stage Docker builds to keep image size under 150MB.\n"
            "2. Set `min-instances: 1` in production to eliminate cold starts for critical paths.\n"
            "3. Use Cloud SQL Auth Proxy or connection poolers (PgBouncer) to avoid connection saturation."
        )
        suggested = [
            "Explain Line 18",
            "Test Edge Cases",
            "How does Make.com trigger nudges?",
        ]
        code_fix = None

    else:
        response_text = (
            f"In the **{module.title}** brief, your primary objective is to align "
            f"container infrastructure declarations with Cloud Run production networking. "
            f"Review the step checklist on the left and check the syntax in `service.yaml`."
        )
        suggested = [
            "Explain Line 18",
            "Show Best Practices",
            "Test Edge Cases",
        ]
        code_fix = None

    return TutorQueryResponse(
        response=response_text,
        suggested_actions=suggested,
        code_fix=code_fix,
    )
