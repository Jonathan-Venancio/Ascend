from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, UserSkill, UserQuest, UnlockedTitle, UserReward
from schemas import ProfileResponse, UserResponse, TitleUpdate, UserSkillResponse, UserQuestResponse
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
    
    # Get user rewards
    user_rewards = db.query(UserReward).filter(
        UserReward.user_id == current_user.id
    ).order_by(UserReward.purchased_at.desc()).all()
    
    return ProfileResponse(
        user=current_user,
        skills=user_skills,
        quests=user_quests,
        unlocked_titles=[title.title for title in unlocked_titles],
        user_rewards=user_rewards
    )


@router.get("/stats", response_model=UserResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_active_user)
):
    return current_user


@router.put("/title")
async def update_selected_title(
    title_data: TitleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if title is unlocked
    unlocked_title = db.query(UnlockedTitle).filter(
        UnlockedTitle.user_id == current_user.id,
        UnlockedTitle.title == title_data.title
    ).first()
    
    if not unlocked_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title not unlocked"
        )
    
    # Update selected title
    current_user.selected_title = title_data.title
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Title updated successfully", "title": title_data.title}
