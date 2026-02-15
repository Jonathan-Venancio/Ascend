from datetime import datetime, timezone

class User:
    def __init__(self, user_id: int, name: str, xp_total: int = 0, coins: int = 0, level: int = 0, created_at: datetime | None = None, ):

        self._id = user_id
        self._name = name
        self._xp_total = xp_total
        self._coins = coins
        self._xp_total = xp_total
        self._level = level
        self._created_at = created_at or datetime.now(timezone.utc)

        self._validate_state()
    
    # Propeties (read-only)

    @property
    def id(self) -> int:
        return self._id

    @property
    def name(self) -> str:
        return self._name
    
    @property
    def xp_total(self) -> int:
        return self.xp_total
    
    @property
    def coins(self) -> int:
        return self.coins
    
    @property
    def xp_total(self) -> int:
        return self.xp_total
    
    @property
    def level(self) -> int:
        return self.level
    
    @property
    def created_at(self) -> datetime:
        return self.created_at
    
    # Core behavior

    def apply_progress(self, xp_gain: int, coin_gain: int) -> None:
        """
        Aqui é onde é atribuido as recompensas de atividade ao usuário.
        Este é o principal ponto de entrada para o progresso.
        """

        if xp_gain < 0 or coin_gain < 0:
            raise ValueError("Os valores de progresso não podem ser negativos.")
        
        self._xp_total += xp_gain
        self._coins += coin_gain

        self._recalculate_level()
        self._validate_state()

    def spend_coins(self, amount: int) -> None:
        """
        Aqui é onde se gasta as moedas com segurança.
        """

        if amount <= 0:
            raise ValueError("O valor gasto deve ser positivo.")
        if amount > self._coins:
            raise ValueError("Não há moedas suficientes")
        
        self._coins -= amount
        self._validate_state()

    # Regras Internas

    def _recalculate_level(self) -> None:
        """
        A fórmula de nivelamento está aqui.
        Esta regra pode ser alterada se for preciso.
        """

        self._level = self._xp_total // 100

    def _validate_state(self) -> None:
        """
        Proteje a integridade do domínio
        """

        if self._xp_total < 0:
            raise ValueError("XP não pode ser negativo.")
        
        if self._coins < 0:
            raise ValueError("Moedas não pode ser negativo")
        
        if self._level < 0:
            raise ValueError("Level não pode ser negativo")
        
    # Debug / representation

    def __repr__(self) -> str:
        return (f"User(id={self._id}, name='{self._name}', xp={self._xp_total}, coins={self._coins}, level{self._level})")
