from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import random

from database import get_db
from models import User, Skill, SkillMilestone, UserSkill
from schemas import SkillCreate, SkillResponse, UserSkillResponse, SkillMilestoneBase, SkillMilestoneResponse
from auth import get_current_active_user

router = APIRouter()


def generate_random_color() -> str:
    """Generate a random HSL color with good saturation and lightness for neon effect"""
    # Hue: 0-360 (full color spectrum)
    # Saturation: 70-100% (vibrant colors)
    # Lightness: 45-65% (good contrast for neon effect)
    hue = random.randint(0, 360)
    saturation = random.randint(70, 100)
    lightness = random.randint(45, 65)
    
    return f"{hue} {saturation}% {lightness}%"


@router.get("/", response_model=List[SkillResponse])
async def get_skills(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    skills = db.query(Skill).offset(skip).limit(limit).all()
    return skills


@router.post("/", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Determine color: random for root skills, inherit from parent for child skills
    if skill.parent_id is None:
        # Root skill: generate random color
        color = generate_random_color()
    else:
        # Child skill: use parent's color
        parent_skill = db.query(Skill).filter(Skill.id == skill.parent_id).first()
        if not parent_skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent skill not found"
            )
        color = parent_skill.color
    
    db_skill = Skill(
        name=skill.name,
        parent_id=skill.parent_id,
        color=color
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    
    # Add milestones if provided
    for milestone in skill.milestones or []:
        db_milestone = SkillMilestone(
            skill_id=db_skill.id,
            level=milestone.level,
            title=milestone.title
        )
        db.add(db_milestone)
    
    db.commit()
    db.refresh(db_skill)
    return db_skill


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill


@router.delete("/{skill_id}")
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully"}


@router.post("/{skill_id}/acquire")
async def acquire_skill(
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
    
    # Check if user already has this skill
    existing_user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill_id
    ).first()
    
    if existing_user_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill already acquired"
        )
    
    # Create user skill
    user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=skill_id,
        level=1,
        xp=0,
        xp_to_next=100
    )
    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)
    
    return {"message": "Skill acquired successfully", "user_skill": user_skill}


@router.get("/my/", response_model=List[UserSkillResponse])
async def get_my_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_skills = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id
    ).all()
    return user_skills


@router.post("/{skill_id}/milestones", response_model=SkillMilestoneResponse)
async def add_milestone(
    skill_id: int,
    milestone: SkillMilestoneBase,
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
    
    # Check if milestone already exists for this level
    existing_milestone = db.query(SkillMilestone).filter(
        SkillMilestone.skill_id == skill_id,
        SkillMilestone.level == milestone.level
    ).first()
    
    if existing_milestone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Milestone already exists for this level"
        )
    
    db_milestone = SkillMilestone(
        skill_id=skill_id,
        level=milestone.level,
        title=milestone.title
    )
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


@router.delete("/{skill_id}/milestones/{level}")
async def remove_milestone(
    skill_id: int,
    level: int,
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
    
    milestone = db.query(SkillMilestone).filter(
        SkillMilestone.skill_id == skill_id,
        SkillMilestone.level == level
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    db.delete(milestone)
    db.commit()
    return {"message": "Milestone deleted successfully"}
