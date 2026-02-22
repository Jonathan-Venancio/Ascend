from ..repositories.interfaces import UserRepository, RewardRepository, PurchaseRepository
from ..domain.user import User
from ..domain.reward import Reward, Purchase

class RewardService:
    def __init__(self, user_repo: UserRepository, reward_repo: RewardRepository, purchase_repo: PurchaseRepository):
        self._user_repo = user_repo
        self._reward_repo = reward_repo
        self._purchase_repo = purchase_repo
    
    def purchase_reward(self, user_id: int, reward_id: int) -> dict:
        user = self._user_repo.get_user(user_id)
        reward = self._reward_repo.get_reward(reward_id)
        
        if user.coins < reward.cost:
            raise ValueError("Insufficient coins")
        
        user.spend_coins(reward.cost)
        
        purchase = Purchase(
            purchase_id=self._generate_purchase_id(),
            user_id=user_id,
            reward_id=reward_id
        )
        
        self._purchase_repo.save_purchase(purchase)
        self._user_repo.save_user(user)
        
        return {
            "xp_total": user.xp_total,
            "level": user.level,
            "coins": user.coins
        }
    
    def _generate_purchase_id(self) -> int:
        import time
        return int(time.time() * 1000)
