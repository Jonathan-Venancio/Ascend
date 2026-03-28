from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, Skill, Quest, UserQuest, UserSkill, UnlockedTitle
from schemas import (
    QuestCreate, 
    QuestResponse, 
    UserQuestResponse,
    CompleteQuestRequest,
    CompleteQuestResponse
)
from auth import get_current_active_user

router = APIRouter()


def calculate_level(total_xp: int) -> int:
    return (total_xp // 100) + 1


@router.get("/", response_model=List[QuestResponse])
async def get_quests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    quests = db.query(Quest).offset(skip).limit(limit).all()
    return quests


@router.post("/", response_model=QuestResponse)
async def create_quest(
    quest: QuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if skill exists
    skill = db.query(Skill).filter(Skill.id == quest.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    db_quest = Quest(
        skill_id=quest.skill_id,
        title=quest.title,
        description=quest.description,
        xp_reward=quest.xp_reward,
        coin_reward=quest.coin_reward,
        recurring=quest.recurring,
        recurrence_interval=quest.recurrence_interval,
        created_by=current_user.id
    )
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest


@router.get("/my/", response_model=List[UserQuestResponse])
async def get_my_quests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_quests = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id
    ).all()
    return user_quests


@router.post("/assign/{quest_id}")
async def assign_quest(
    quest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if quest exists
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found"
        )
    
    # Check if user already has this quest
    existing_user_quest = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id,
        UserQuest.quest_id == quest_id
    ).first()
    
    if existing_user_quest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest already assigned"
        )
    
    # Create user quest
    user_quest = UserQuest(
        user_id=current_user.id,
        quest_id=quest_id,
        completed=False
    )
    db.add(user_quest)
    db.commit()
    
    return {"message": "Quest assigned successfully"}


@router.post("/complete", response_model=CompleteQuestResponse)
async def complete_quest(
    request: CompleteQuestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get user quest
    user_quest = db.query(UserQuest).filter(
        UserQuest.user_id == current_user.id,
        UserQuest.quest_id == request.quest_id
    ).first()
    
    if not user_quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found or not assigned"
        )
    
    if user_quest.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest already completed"
        )
    
    quest = user_quest.quest
    
    # Mark quest as completed
    user_quest.completed = True
    user_quest.completed_at = datetime.utcnow()
    
    # Update user coins and XP
    current_user.coins += quest.coin_reward
    current_user.total_xp += quest.xp_reward
    new_level = calculate_level(current_user.total_xp)
    current_user.player_level = new_level
    
    # Get or create user skill
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == quest.skill_id
    ).first()
    
    titles_unlocked = []
    
    if user_skill:
        # Add XP to skill
        user_skill.xp += quest.xp_reward
        
        # Check for level up
        if user_skill.xp >= user_skill.xp_to_next:
            user_skill.level += 1
            user_skill.xp = user_skill.xp - user_skill.xp_to_next
            user_skill.xp_to_next += 50
            
            # Check for milestones
            skill = quest.skill
            for milestone in skill.milestones:
                if user_skill.level >= milestone.level:
                    # Check if title is already unlocked
                    existing_title = db.query(UnlockedTitle).filter(
                        UnlockedTitle.user_id == current_user.id,
                        UnlockedTitle.title == milestone.title
                    ).first()
                    
                    if not existing_title:
                        new_title = UnlockedTitle(
                            user_id=current_user.id,
                            title=milestone.title
                        )
                        db.add(new_title)
                        titles_unlocked.append(milestone.title)
    
    db.commit()
    
    return CompleteQuestResponse(
        message=f"Quest '{quest.title}' completed successfully!",
        xp_gained=quest.xp_reward,
        coins_gained=quest.coin_reward,
        new_level=new_level if new_level > current_user.player_level - 1 else None,
        titles_unlocked=titles_unlocked
    )


@router.delete("/{quest_id}")
async def delete_quest(
    quest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found"
        )
    
    # Check if user is the creator
    if quest.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this quest"
        )
    
    db.delete(quest)
    db.commit()
    return {"message": "Quest deleted successfully"}
