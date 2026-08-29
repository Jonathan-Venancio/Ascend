# Ascend Backend

Backend API for the Ascend gamification system built with FastAPI and SQLAlchemy.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Skills System**: Hierarchical skills with levels, XP, and milestones
- **Quests System**: Create and complete quests with XP and coin rewards
- **Rewards Shop**: Buy rewards with earned coins
- **User Profile**: Track progress, levels, and unlocked titles
- **Multi-user Support**: Each user has their own progress

## Tech Stack

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Default database (easily configurable for PostgreSQL/MySQL)
- **JWT**: Token-based authentication
- **Pydantic**: Data validation and serialization

## Setup

Requisitos: [Poetry](https://python-poetry.org/) (recomendado via pipx) e Python 3.11+.

1. **Instalar dependências**:
```bash
cd AscendBackend
poetry install
```

2. **Rodar com Taskipy**:
```bash
poetry run task backend    # só o backend (http://localhost:8000)
poetry run task frontend   # só o frontend (http://localhost:8080)
poetry run task run        # abre 2 terminais: back + front
```

O ambiente virtual fica em `.venv/` dentro do projeto (configurado em `poetry.toml`).

Também funciona assim:
```bash
poetry shell
task backend
```

The API will be available at `http://localhost:8000`

3. **View API documentation**:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Skills
- `GET /api/skills/` - Get all skills
- `POST /api/skills/` - Create new skill
- `GET /api/skills/{skill_id}` - Get specific skill
- `POST /api/skills/{skill_id}/acquire` - Acquire skill for user
- `GET /api/skills/my/` - Get user's acquired skills

### Quests
- `GET /api/quests/` - Get all quests
- `POST /api/quests/` - Create new quest
- `POST /api/quests/assign/{quest_id}` - Assign quest to user
- `POST /api/quests/complete` - Complete quest (gain XP/coins)
- `GET /api/quests/my/` - Get user's quests

### Rewards
- `GET /api/rewards/` - Get all rewards
- `POST /api/rewards/` - Create new reward
- `POST /api/rewards/buy` - Buy reward with coins
- `GET /api/rewards/my/` - Get user's purchased rewards

### Profile
- `GET /api/profile/` - Get complete user profile
- `GET /api/profile/stats` - Get user statistics
- `PUT /api/profile/title` - Update selected title

## Authentication

All endpoints (except register and login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Database

The app uses SQLite by default (`ascend.db`). To use PostgreSQL or MySQL, set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost/dbname"
```

## Game Mechanics

- **XP System**: 100 XP = 1 level
- **Skill Progress**: Each skill has independent XP and levels
- **Quest Rewards**: Completing quests grants XP and coins
- **Milestones**: Unlock titles by reaching specific skill levels
- **Skill Hierarchy**: Skills can have parent-child relationships

## Development

The project structure:
```
AscendBackend/
├── main.py              # FastAPI app setup
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication utilities
├── routers/             # API route modules
│   ├── auth.py
│   ├── skills.py
│   ├── quests.py
│   ├── rewards.py
│   └── profile.py
├── pyproject.toml       # Dependências (Poetry)
├── poetry.lock          # Lock file das dependências
└── poetry.toml          # Configuração local do Poetry
```
