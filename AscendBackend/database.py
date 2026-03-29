from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ascend.db")

print(f"Database URL: {DATABASE_URL}")  # Debug log

# Create engine with appropriate configuration for each database type
if "sqlite" in DATABASE_URL:
    print("Using SQLite database")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
elif "postgres" in DATABASE_URL:  # Detect both postgres:// and postgresql://
    print("Using PostgreSQL database")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections are alive
        pool_recycle=300,   # Recycle connections every 5 minutes
        echo=False           # Set to True for SQL logging in dev
    )
else:
    print(f"Unknown database type in URL: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
