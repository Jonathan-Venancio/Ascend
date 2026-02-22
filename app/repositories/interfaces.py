from typing import Protocol
from ..domain.user import User
from ..domain.activity import Activity
from ..domain.reward import Reward, Purchase

class UserRepository(Protocol):
    def get_user(self, user_id: int) -> User:
        ...
    
    def save_user(self, user: User) -> User:
        ...

class ActivityRepository(Protocol):
    def save_activity(self, activity: Activity) -> Activity:
        ...
    
    def list_user_activities(self, user_id: int) -> list[Activity]:
        ...

class RewardRepository(Protocol):
    def get_reward(self, reward_id: int) -> Reward:
        ...
    
    def save_reward(self, reward: Reward) -> Reward:
        ...
    
    def list_user_rewards(self, user_id: int) -> list[Reward]:
        ...

class PurchaseRepository(Protocol):
    def save_purchase(self, purchase: Purchase) -> Purchase:
        ...
    
    def list_user_purchases(self, user_id: int) -> list[Purchase]:
        ...
