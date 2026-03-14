from fastapi import APIRouter, HTTPException, Query
from ..services.activity_service import ActivityService
from ..services.reward_service import RewardService
from ..database.sqlite_repositories import SQLiteUserRepository, SQLiteActivityRepository, SQLiteRewardRepository, SQLitePurchaseRepository
from ..domain.user import User
from .schemas import ActivityRequest, UserResponse, ProgressResponse

router = APIRouter()

user_repo = SQLiteUserRepository()
activity_repo = SQLiteActivityRepository()
reward_repo = SQLiteRewardRepository()
purchase_repo = SQLitePurchaseRepository()

activity_service = ActivityService(user_repo, activity_repo)
reward_service = RewardService(user_repo, reward_repo, purchase_repo)

@router.post("/activities", response_model=ProgressResponse, summary="Registrar Atividade", description="Registra uma nova atividade para o usuário, concedendo XP e moedas")
async def register_activity(request: ActivityRequest):
    """
    Registra uma atividade do usuário e atualiza seu progresso.
    
    - **user_id**: ID do usuário
    - **skill_id**: ID da habilidade/prática
    - **xp_gain**: Quantidade de XP a ganhar
    - **coins_gain**: Quantidade de moedas a ganhar
    - **description**: Descrição opcional da atividade
    """
    try:
        result = activity_service.register_activity(
            user_id=request.user_id,
            skill_id=request.skill_id,
            xp_gain=request.xp_gain,
            coins_gain=request.coins_gain,
            description=request.description
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewards/{reward_id}/purchase", response_model=ProgressResponse, summary="Comprar Recompensa", description="Compra uma recompensa utilizando as moedas do usuário")
async def purchase_reward(reward_id: int, user_id: int = Query(..., description="ID do usuário que está comprando")):
    """
    Permite que um usuário compre uma recompensa usando suas moedas.
    
    - **reward_id**: ID da recompensa desejada
    - **user_id**: ID do usuário (query parameter)
    """
    try:
        result = reward_service.purchase_reward(user_id=user_id, reward_id=reward_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse, summary="Obter Dashboard do Usuário", description="Retorna informações completas do usuário incluindo XP, nível e moedas")
async def get_user(user_id: int):
    """
    Obtém o dashboard completo do usuário com todas as suas estatísticas.
    
    - **user_id**: ID do usuário a ser consultado
    """
    try:
        user = user_repo.get_user(user_id)
        return UserResponse(
            id=user.id,
            name=user.name,
            xp_total=user.xp_total,
            level=user.level,
            coins=user.coins
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users", response_model=UserResponse, summary="Criar Usuário", description="Cria um novo usuário no sistema")
async def create_user(name: str = Query(..., description="Nome do usuário"), user_id: int = Query(1, description="ID do usuário (padrão: 1)")):
    """
    Cria um novo usuário no sistema com XP, nível e moedas iniciais.
    
    - **name**: Nome do usuário (query parameter)
    - **user_id**: ID único do usuário (query parameter, padrão: 1)
    """
    try:
        user = User(id=user_id, name=name, xp_total=0, level=1, coins=0)
        user_repo.create_user(user)
        return UserResponse(
            id=user.id,
            name=user.name,
            xp_total=user.xp_total,
            level=user.level,
            coins=user.coins
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
