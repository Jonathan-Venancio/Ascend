from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RecurrenceInterval


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    coins: int
    total_xp: int
    player_level: int
    selected_title: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# Skill schemas
class SkillMilestoneBase(BaseModel):
    level: int
    title: str


class SkillMilestoneResponse(SkillMilestoneBase):
    id: int

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str
    parent_id: Optional[int] = None
    color: Optional[str] = None  # Backend will generate random color for root skills


class SkillCreate(SkillBase):
    milestones: Optional[List[SkillMilestoneBase]] = []


class SkillResponse(SkillBase):
    id: int
    created_at: datetime
    milestones: List[SkillMilestoneResponse] = []

    class Config:
        from_attributes = True


# UserSkill schemas
class UserSkillResponse(BaseModel):
    id: int
    skill_id: int
    level: int
    xp: int
    xp_to_next: int
    skill: SkillResponse

    class Config:
        from_attributes = True


# Quest schemas
class QuestBase(BaseModel):
    skill_id: int
    title: str
    description: str
    xp_reward: int
    coin_reward: int
    recurring: bool = False
    recurrence_interval: Optional[RecurrenceInterval] = None


class QuestCreate(QuestBase):
    pass


class QuestResponse(QuestBase):
    id: int
    created_at: datetime
    skill: SkillResponse

    class Config:
        from_attributes = True


class UserQuestResponse(BaseModel):
    id: int
    quest_id: int
    completed: bool
    completed_at: Optional[datetime]
    quest: QuestResponse

    class Config:
        from_attributes = True


class TitleUpdate(BaseModel):
    title: str


# Reward schemas
class RewardBase(BaseModel):
    name: str
    description: str
    cost: int
    emoji: str


class RewardCreate(RewardBase):
    pass


class RewardResponse(RewardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserRewardResponse(BaseModel):
    id: int
    reward_id: int
    purchased_at: datetime
    reward: RewardResponse

    class Config:
        from_attributes = True


# Profile schemas
class ProfileResponse(BaseModel):
    user: UserResponse
    skills: List[UserSkillResponse]
    quests: List[UserQuestResponse]
    unlocked_titles: List[str]
    user_rewards: List[UserRewardResponse]


# Progress schemas
class CompleteQuestRequest(BaseModel):
    quest_id: int


class CompleteQuestResponse(BaseModel):
    message: str
    xp_gained: int
    coins_gained: int
    new_level: Optional[int] = None
    titles_unlocked: List[str] = []


class BuyRewardRequest(BaseModel):
    reward_id: int


class BuyRewardResponse(BaseModel):
    message: str
    remaining_coins: int
