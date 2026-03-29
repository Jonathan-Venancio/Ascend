from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, Reward, UserReward
from schemas import RewardBase, RewardResponse, RewardCreate, BuyRewardRequest, BuyRewardResponse, UserRewardResponse
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
    print(f"DEBUG: User {current_user.id} trying to buy reward {request.reward_id}")
    print(f"DEBUG: User coins: {current_user.coins}")
    
    # Get reward
    reward = db.query(Reward).filter(Reward.id == request.reward_id).first()
    if not reward:
        print(f"DEBUG: Reward {request.reward_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    print(f"DEBUG: Reward found: {reward.name}, cost: {reward.cost}")
    
    # Check if user has enough coins
    if current_user.coins < reward.cost:
        print(f"DEBUG: Not enough coins. User has {current_user.coins}, needs {reward.cost}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough coins"
        )
    
    print(f"DEBUG: Processing purchase...")
    # Process purchase
    current_user.coins -= reward.cost
    
    user_reward = UserReward(
        user_id=current_user.id,
        reward_id=request.reward_id,
        purchased_at=datetime.utcnow()  # Add purchase timestamp
    )
    db.add(user_reward)
    db.commit()
    
    print(f"DEBUG: Purchase completed. Remaining coins: {current_user.coins}")
    
    return BuyRewardResponse(
        message=f"Reward '{reward.name}' purchased successfully!",
        remaining_coins=current_user.coins
    )


@router.get("/my/", response_model=List[UserRewardResponse])
async def get_my_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_rewards = db.query(UserReward).filter(
        UserReward.user_id == current_user.id
    ).order_by(UserReward.purchased_at.desc()).all()
    
    return user_rewards


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
