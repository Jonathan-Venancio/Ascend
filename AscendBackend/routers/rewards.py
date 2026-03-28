from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Reward, UserReward
from schemas import RewardCreate, RewardResponse, BuyRewardRequest, BuyRewardResponse
from auth import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[RewardResponse])
async def get_rewards(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    rewards = db.query(Reward).offset(skip).limit(limit).all()
    return rewards


@router.post("/", response_model=RewardResponse)
async def create_reward(
    reward: RewardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_reward = Reward(
        name=reward.name,
        description=reward.description,
        cost=reward.cost,
        emoji=reward.emoji,
        created_by=current_user.id
    )
    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward


@router.post("/buy", response_model=BuyRewardResponse)
async def buy_reward(
    request: BuyRewardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get reward
    reward = db.query(Reward).filter(Reward.id == request.reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # Check if user has enough coins
    if current_user.coins < reward.cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough coins"
        )
    
    # Check if user already bought this reward
    existing_purchase = db.query(UserReward).filter(
        UserReward.user_id == current_user.id,
        UserReward.reward_id == request.reward_id
    ).first()
    
    if existing_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward already purchased"
        )
    
    # Process purchase
    current_user.coins -= reward.cost
    
    user_reward = UserReward(
        user_id=current_user.id,
        reward_id=request.reward_id
    )
    db.add(user_reward)
    db.commit()
    
    return BuyRewardResponse(
        message=f"Successfully purchased '{reward.name}'!",
        remaining_coins=current_user.coins
    )


@router.get("/my/", response_model=List[RewardResponse])
async def get_my_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_rewards = db.query(UserReward).filter(
        UserReward.user_id == current_user.id
    ).all()
    
    rewards = [user_reward.reward for user_reward in user_rewards]
    return rewards


@router.delete("/{reward_id}")
async def delete_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # Check if user is the creator
    if reward.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reward"
        )
    
    db.delete(reward)
    db.commit()
    return {"message": "Reward deleted successfully"}
