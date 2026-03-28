from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, UserSkill, UserQuest, UnlockedTitle
from schemas import ProfileResponse, UserResponse, UserSkillResponse, UserQuestResponse
from auth import get_current_active_user

router = APIRouter()


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get user skills
    user_skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id
    ).all()
    
    # Get user quests
    user_quests = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id
    ).all()
    
    # Get unlocked titles
    unlocked_titles = db.query(UnlockedTitle).filter(
        UnlockedTitle.user_id == current_user.id
    ).all()
    
    return ProfileResponse(
        user=current_user,
        skills=user_skills,
        quests=user_quests,
        unlocked_titles=[title.title for title in unlocked_titles]
    )


@router.get("/stats", response_model=UserResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_active_user)
):
    return current_user


@router.put("/title")
async def update_selected_title(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if title is unlocked
    unlocked_title = db.query(UnlockedTitle).filter(
        UnlockedTitle.user_id == current_user.id,
        UnlockedTitle.title == title
    ).first()
    
    if not unlocked_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title not unlocked"
        )
    
    # Update selected title
    current_user.selected_title = title
    db.commit()
    
    return {"message": f"Title updated to '{title}'"}
