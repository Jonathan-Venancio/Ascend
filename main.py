from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.endpoints import router
from app.database.sqlite_repositories import SQLiteUserRepository
from app.domain.user import User

@asynccontextmanager
async def lifespan(app: FastAPI):
    user_repo = SQLiteUserRepository()
    try:
        user = user_repo.get_user(1)
    except ValueError:
        default_user = User(user_id=1, name="Player One")
        user_repo.save_user(default_user)
    yield

app = FastAPI(
    title="ASCEND - Gamification System",
    version="1.0.0",
    description="""
    ## Sistema de Gamificação para Evolução Pessoal
    
    O ASCEND é um sistema completo de gamificação que permite:
    - Registrar atividades e ganhar XP
    - Acumular moedas virtuais
    - Subir de nível automaticamente
    - Comprar recompensas com moedas
    
    ### Como usar:
    1. Crie um usuário
    2. Registre atividades para ganhar XP e moedas
    3. Compre recompensas com suas moedas
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.include_router(router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "ASCEND - Gamification System", 
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
