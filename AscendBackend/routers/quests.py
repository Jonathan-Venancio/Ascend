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
    skill_acquired_automatically = False
    
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
        
        # Distribute XP to parent skills (100% of XP to each parent in the chain)
        current_skill = quest.skill
        parent_xp = quest.xp_reward  # 100% of XP
        
        while current_skill.parent_id:
            parent_skill = db.query(Skill).filter(Skill.id == current_skill.parent_id).first()
            if not parent_skill:
                break
                
            # Get or create parent user skill
            parent_user_skill = db.query(UserSkill).filter(
                UserSkill.user_id == current_user.id,
                UserSkill.skill_id == parent_skill.id
            ).first()
            
            if not parent_user_skill:
                # Auto-acquire parent skill if it doesn't exist
                parent_user_skill = UserSkill(
                    user_id=current_user.id,
                    skill_id=parent_skill.id,
                    level=1,
                    xp=parent_xp,
                    xp_to_next=100
                )
                db.add(parent_user_skill)
            else:
                # Add XP to parent skill
                parent_user_skill.xp += parent_xp
                
                # Check for level up in parent
                if parent_user_skill.xp >= parent_user_skill.xp_to_next:
                    parent_user_skill.level += 1
                    parent_user_skill.xp = parent_user_skill.xp - parent_user_skill.xp_to_next
                    parent_user_skill.xp_to_next += 50
                    
                    # Check for milestones in parent
                    for milestone in parent_skill.milestones:
                        if parent_user_skill.level >= milestone.level:
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
            
            # Move up the chain (give 100% XP to all parents)
            current_skill = parent_skill
    else:
        # Auto-acquire the skill if user doesn't have it yet
        skill_acquired_automatically = True
        user_skill = UserSkill(
            user_id=current_user.id,
            skill_id=quest.skill_id,
            level=1,
            xp=quest.xp_reward,
            xp_to_next=100
        )
        db.add(user_skill)
        
        # Check for immediate milestones (level 1)
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
        
        # Also distribute XP to parent skills for auto-acquired skills
        current_skill = quest.skill
        parent_xp = quest.xp_reward  # 100% of XP
        
        while current_skill.parent_id:
            parent_skill = db.query(Skill).filter(Skill.id == current_skill.parent_id).first()
            if not parent_skill:
                break
                
            # Get or create parent user skill
            parent_user_skill = db.query(UserSkill).filter(
                UserSkill.user_id == current_user.id,
                UserSkill.skill_id == parent_skill.id
            ).first()
            
            if not parent_user_skill:
                # Auto-acquire parent skill if it doesn't exist
                parent_user_skill = UserSkill(
                    user_id=current_user.id,
                    skill_id=parent_skill.id,
                    level=1,
                    xp=parent_xp,
                    xp_to_next=100
                )
                db.add(parent_user_skill)
            else:
                # Add XP to parent skill
                parent_user_skill.xp += parent_xp
                
                # Check for level up in parent
                if parent_user_skill.xp >= parent_user_skill.xp_to_next:
                    parent_user_skill.level += 1
                    parent_user_skill.xp = parent_user_skill.xp - parent_user_skill.xp_to_next
                    parent_user_skill.xp_to_next += 50
                    
                    # Check for milestones in parent
                    for milestone in parent_skill.milestones:
                        if parent_user_skill.level >= milestone.level:
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
            
            # Move up the chain (give 100% XP to all parents)
            current_skill = parent_skill
    
    db.commit()
    
    # Build message
    message_parts = [f"Quest '{quest.title}' completed successfully!"]
    if skill_acquired_automatically:
        message_parts.append(f"Skill '{quest.skill.name}' acquired automatically!")
    
    return CompleteQuestResponse(
        message="; ".join(message_parts),
        xp_gained=quest.xp_reward,
        coins_gained=quest.coin_reward,
        new_level=new_level if new_level > current_user.player_level - 1 else None,
        titles_unlocked=titles_unlocked
    )


@router.post("/generate/{skill_id}", response_model=QuestResponse)
async def generate_quest(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if skill exists
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Get user's current skill level (if user has this skill)
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill_id
    ).first()
    
    skill_level = user_skill.level if user_skill else 1
    
    # Generate quest based on skill level
    quest_templates = {
        1: [
            {"title": f"Primeiros passos em {skill.name}", "description": f"Complete um exercício básico de {skill.name}", "xp": 10, "coins": 5},
            {"title": f"Conceitos de {skill.name}", "description": f"Estude os conceitos fundamentais de {skill.name}", "xp": 15, "coins": 8},
        ],
        2: [
            {"title": f"Praticando {skill.name}", "description": f"Complete 3 exercícios de {skill.name}", "xp": 25, "coins": 12},
            {"title": f"Pequeno projeto em {skill.name}", "description": f"Crie um mini-projeto usando {skill.name}", "xp": 30, "coins": 15},
        ],
        3: [
            {"title": f"Aprofundando em {skill.name}", "description": f"Estude tópicos avançados de {skill.name}", "xp": 40, "coins": 20},
            {"title": f"Desafio de {skill.name}", "description": f"Complete um desafio intermediário de {skill.name}", "xp": 45, "coins": 22},
        ],
    }
    
    # Get templates for current level or default to level 3
    templates = quest_templates.get(min(skill_level, 3), quest_templates[3])
    
    # Select a random template
    import random
    template = random.choice(templates)
    
    # Create quest
    db_quest = Quest(
        skill_id=skill_id,
        title=template["title"],
        description=template["description"],
        xp_reward=template["xp"],
        coin_reward=template["coins"],
        recurring=False,
        created_by=current_user.id
    )
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    
    # Auto-assign the quest to the user
    user_quest = UserQuest(
        user_id=current_user.id,
        quest_id=db_quest.id,
        completed=False
    )
    db.add(user_quest)
    db.commit()
    
    return db_quest


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
    
    # First, delete all UserQuest references
    db.query(UserQuest).filter(UserQuest.quest_id == quest_id).delete()
    
    # Then delete the quest
    db.delete(quest)
    db.commit()
    return {"message": "Quest deleted successfully"}
