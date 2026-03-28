from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Skill, SkillMilestone, UserSkill
from schemas import SkillCreate, SkillResponse, UserSkillResponse, SkillMilestoneBase
from auth import get_current_active_user

router = APIRouter()


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
    db_skill = Skill(
        name=skill.name,
        parent_id=skill.parent_id,
        color=skill.color
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
