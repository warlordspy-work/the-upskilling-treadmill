"""
User Progress and Microlearning Quiz API Routes.

Handles step progression, persistent sandbox drafts, and 3-minute quiz
answer evaluation with streak tracking.
"""

from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.module import LearningModule
from app.models.progress import UserProgress
from app.models.user import User
from app.schemas.progress import (
    ProgressUpdate,
    ProgressResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)

router = APIRouter(prefix="/api/progress", tags=["Progress & Quizzes"])


@router.get("/{user_id}", response_model=List[ProgressResponse])
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all progress records for a specific learner.
    """
    records = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id)
        .all()
    )
    return records


@router.put("/{user_id}/{module_id}", response_model=ProgressResponse)
def update_progress(
    user_id: int,
    module_id: int,
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
):
    """
    Updates the step number, sandbox code draft, or completion status.
    """
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.module_id == module_id,
        )
        .first()
    )

    if not progress:
        progress = UserProgress(
            user_id=user_id,
            module_id=module_id,
            status=payload.status or "in_progress",
            current_step=payload.current_step or 1,
            code_draft=payload.code_draft,
            last_terminal_output=payload.last_terminal_output,
        )
        db.add(progress)
    else:
        if payload.status:
            progress.status = payload.status
        if payload.current_step:
            progress.current_step = payload.current_step
        if payload.code_draft is not None:
            progress.code_draft = payload.code_draft
        if payload.last_terminal_output is not None:
            progress.last_terminal_output = payload.last_terminal_output

        if progress.status == "completed" and not progress.completed_at:
            progress.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(progress)
    return progress


@router.post("/quiz", response_model=QuizSubmitResponse)
def submit_quiz_answer(
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
):
    """
    Submits answer to the 3-minute WhatsApp daily microlearning quiz.
    Increments learner streak upon correct response.
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    module = (
        db.query(LearningModule)
        .filter(LearningModule.id == payload.module_id)
        .first()
    )

    if not user or not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User or Learning Module not found.",
        )

    is_correct = payload.selected_option_index == module.quiz_correct_index

    if is_correct:
        user.streak_count += 1

    # Record progress state
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
            quiz_answered=True,
            quiz_selected_index=payload.selected_option_index,
            quiz_is_correct=is_correct,
        )
        db.add(progress)
    else:
        progress.quiz_answered = True
        progress.quiz_selected_index = payload.selected_option_index
        progress.quiz_is_correct = is_correct

    db.commit()

    return QuizSubmitResponse(
        is_correct=is_correct,
        correct_option_index=module.quiz_correct_index,
        explanation=module.quiz_explanation,
        updated_streak=user.streak_count,
    )
