from datetime import datetime, timezone

class Activity:

    def __init__(self, activity_id, user_id, skill_id, descricao=None, xp_ganho=0, moedas_ganhas=0, data=None):

        if activity_id is None:
            raise ValueError("Activity precisa de id")

        if user_id is None:
            raise ValueError("O id de usuario não pode ser vazio.")
        
        if skill_id is None:
            raise ValueError("O id de skill não pode ser vazio.")

        if xp_ganho < 0:
            raise ValueError("Ganho de XP não pode ser negativo.")
        
        if moedas_ganhas < 0:
            raise ValueError("Ganho de Moedas não pode ser negativo.")
        
        if data is None:
            data = datetime.now(timezone.utc)

        self._id = activity_id
        self._user_id = user_id
        self._skill_id = skill_id
        self._descricao = descricao
        self._xp_ganho = xp_ganho
        self._moedas_ganhas = moedas_ganhas
        self._data = data

    # Propeties (somente leitura)

    @property
    def id(self):
        return self._id

    @property
    def user_id(self):
        return self._user_id
    
    @property
    def skill_id(self):
        return self._skill_id
    
    @property
    def descricao(self):
        return self._descricao
    
    @property
    def xp_ganho(self):
        return self._xp_ganho
    
    @property
    def moedas_ganhas(self):
        return self._moedas_ganhas
    
    @property
    def data(self):
        return self._data
    
    def __repr__(self):
        return (f"Activity(id={self._id}, user_id={self._user_id}, skill_id={self._skill_id}, xp={self._xp_ganho}, moedas={self._moedas_ganhas}, data={self._data.isoformat()})")
