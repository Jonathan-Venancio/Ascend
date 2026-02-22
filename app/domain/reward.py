from datetime import datetime, timezone
from typing import Optional

class Reward:
    def __init__(self, reward_id: int, name: str, cost: int):
        if cost <= 0:
            raise ValueError("Cost must be positive")
        if not name or name.strip() == "":
            raise ValueError("Name cannot be empty")
            
        self._id = reward_id
        self._name = name.strip()
        self._cost = cost
    
    @property
    def id(self) -> int:
        return self._id
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def cost(self) -> int:
        return self._cost
    
    def __repr__(self) -> str:
        return f"Reward(id={self._id}, name='{self._name}', cost={self._cost})"


class Purchase:
    def __init__(self, purchase_id: int, user_id: int, reward_id: int, purchased_at: Optional[datetime] = None):
        if user_id <= 0:
            raise ValueError("User ID must be positive")
        if reward_id <= 0:
            raise ValueError("Reward ID must be positive")
            
        self._id = purchase_id
        self._user_id = user_id
        self._reward_id = reward_id
        self._purchased_at = purchased_at or datetime.now(timezone.utc)
    
    @property
    def id(self) -> int:
        return self._id
    
    @property
    def user_id(self) -> int:
        return self._user_id
    
    @property
    def reward_id(self) -> int:
        return self._reward_id
    
    @property
    def purchased_at(self) -> datetime:
        return self._purchased_at
    
    def __repr__(self) -> str:
        return f"Purchase(id={self._id}, user_id={self._user_id}, reward_id={self._reward_id}, purchased_at={self._purchased_at.isoformat()})"
