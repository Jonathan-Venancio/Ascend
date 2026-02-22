from pydantic import BaseModel
from typing import Optional

class ActivityRequest(BaseModel):
    user_id: int
    skill_id: int
    xp_gain: int
    coins_gain: int
    description: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    xp_total: int
    level: int
    coins: int

class ProgressResponse(BaseModel):
    xp_total: int
    level: int
    coins: int
