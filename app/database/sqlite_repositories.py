import sqlite3
from datetime import datetime, timezone
from typing import List, Optional
from ..domain.user import User
from ..domain.activity import Activity
from ..domain.reward import Reward, Purchase
from ..repositories.interfaces import UserRepository, ActivityRepository, RewardRepository, PurchaseRepository

class SQLiteUserRepository(UserRepository):
    def __init__(self, db_path: str = "ascend.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    xp_total INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()
    
    def get_user(self, user_id: int) -> User:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row is None:
                raise ValueError(f"User with id {user_id} not found")
            
            return User(
                user_id=row[0],
                name=row[1],
                xp_total=row[2],
                level=row[3],
                coins=row[4],
                created_at=datetime.fromisoformat(row[5])
            )
    
    def save_user(self, user: User) -> User:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO users (id, name, xp_total, level, coins, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                user.id,
                user.name,
                user.xp_total,
                user.level,
                user.coins,
                user.created_at.isoformat()
            ))
            conn.commit()
        return user

class SQLiteActivityRepository(ActivityRepository):
    def __init__(self, db_path: str = "ascend.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS activities (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    skill_id INTEGER NOT NULL,
                    description TEXT,
                    xp_gain INTEGER NOT NULL,
                    coins_gain INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            conn.commit()
    
    def save_activity(self, activity: Activity) -> Activity:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO activities (id, user_id, skill_id, description, xp_gain, coins_gain, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                activity.id,
                activity.user_id,
                activity.skill_id,
                activity.descricao,
                activity.xp_ganho,
                activity.moedas_ganhas,
                activity.data.isoformat()
            ))
            conn.commit()
        return activity
    
    def list_user_activities(self, user_id: int) -> List[Activity]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC
            """, (user_id,))
            rows = cursor.fetchall()
            
            return [
                Activity(
                    activity_id=row[0],
                    user_id=row[1],
                    skill_id=row[2],
                    descricao=row[3],
                    xp_ganho=row[4],
                    moedas_ganhas=row[5],
                    data=datetime.fromisoformat(row[6])
                )
                for row in rows
            ]

class SQLiteRewardRepository(RewardRepository):
    def __init__(self, db_path: str = "ascend.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS rewards (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    cost INTEGER NOT NULL
                )
            """)
            self._seed_rewards()
            conn.commit()
    
    def _seed_rewards(self):
        cursor = sqlite3.connect(self.db_path).execute("SELECT COUNT(*) FROM rewards")
        if cursor.fetchone()[0] == 0:
            rewards = [
                (1, "Livro Novo", 50),
                (2, "Café Especial", 30),
                (3, "Dia de Folga", 100),
                (4, "Jogo Novo", 200),
                (5, "Curso Online", 150)
            ]
            with sqlite3.connect(self.db_path) as conn:
                conn.executemany("INSERT INTO rewards (id, name, cost) VALUES (?, ?, ?)", rewards)
                conn.commit()
    
    def get_reward(self, reward_id: int) -> Reward:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM rewards WHERE id = ?", (reward_id,))
            row = cursor.fetchone()
            if row is None:
                raise ValueError(f"Reward with id {reward_id} not found")
            
            return Reward(
                reward_id=row[0],
                name=row[1],
                cost=row[2]
            )
    
    def save_reward(self, reward: Reward) -> Reward:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO rewards (id, name, cost)
                VALUES (?, ?, ?)
            """, (reward.id, reward.name, reward.cost))
            conn.commit()
        return reward
    
    def list_user_rewards(self, user_id: int) -> List[Reward]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT * FROM rewards ORDER BY cost")
            rows = cursor.fetchall()
            
            return [
                Reward(
                    reward_id=row[0],
                    name=row[1],
                    cost=row[2]
                )
                for row in rows
            ]

class SQLitePurchaseRepository(PurchaseRepository):
    def __init__(self, db_path: str = "ascend.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS purchases (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    reward_id INTEGER NOT NULL,
                    purchased_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (reward_id) REFERENCES rewards (id)
                )
            """)
            conn.commit()
    
    def save_purchase(self, purchase: Purchase) -> Purchase:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO purchases (id, user_id, reward_id, purchased_at)
                VALUES (?, ?, ?, ?)
            """, (
                purchase.id,
                purchase.user_id,
                purchase.reward_id,
                purchase.purchased_at.isoformat()
            ))
            conn.commit()
        return purchase
    
    def list_user_purchases(self, user_id: int) -> List[Purchase]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM purchases WHERE user_id = ? ORDER BY purchased_at DESC
            """, (user_id,))
            rows = cursor.fetchall()
            
            return [
                Purchase(
                    purchase_id=row[0],
                    user_id=row[1],
                    reward_id=row[2],
                    purchased_at=datetime.fromisoformat(row[3])
                )
                for row in rows
            ]
