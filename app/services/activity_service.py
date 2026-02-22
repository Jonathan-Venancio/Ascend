from typing import Protocol
from ..repositories.interfaces import UserRepository, ActivityRepository
from ..domain.user import User
from ..domain.activity import Activity

class ActivityService:
    def __init__(self, user_repo: UserRepository, activity_repo: ActivityRepository):
        self._user_repo = user_repo
        self._activity_repo = activity_repo
    
    def register_activity(self, user_id: int, skill_id: int, xp_gain: int, coins_gain: int, description: str = None) -> dict:
        user = self._user_repo.get_user(user_id)
        
        activity = Activity(
            activity_id=self._generate_activity_id(),
            user_id=user_id,
            skill_id=skill_id,
            descricao=description,
            xp_ganho=xp_gain,
            moedas_ganhas=coins_gain
        )
        
        user.apply_progress(xp_gain, coins_gain)
        
        self._activity_repo.save_activity(activity)
        self._user_repo.save_user(user)
        
        return {
            "xp_total": user.xp_total,
            "level": user.level,
            "coins": user.coins
        }
    
    def _generate_activity_id(self) -> int:
        import time
        return int(time.time() * 1000)
