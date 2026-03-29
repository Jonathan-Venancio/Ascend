from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from database import engine, Base
from routers import auth, skills, quests, rewards, profile


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Ascend API",
    description="Backend for the Ascend gamification system",
    version="1.0.0",
    lifespan=lifespan
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://localhost:3000",  # Alternative port
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:8080",  # Sua porta atual
        "http://127.0.0.1:8080",  # Alternative localhost
        "http://192.168.1.4:8080",  # Network IP
        "https://ascend.jonathanvenancio.site",  # Production frontend
        "http://ascend.jonathanvenancio.site",   # Alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(quests.router, prefix="/api/quests", tags=["quests"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["rewards"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])


@app.get("/")
async def root():
    return {"message": "Ascend API is running!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
