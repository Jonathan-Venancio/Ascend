#!/usr/bin/env python3
"""
Script para adicionar campo created_by na tabela skills
"""

import os
import sys
from sqlalchemy import create_engine, text
from database import DATABASE_URL

def migrate_skills():
    """Adiciona coluna created_by na tabela skills se não existir"""
    
    engine = create_engine(DATABASE_URL)
    
    # Detectar tipo de banco de dados
    if "sqlite" in DATABASE_URL:
        return migrate_sqlite(engine)
    elif "postgresql" in DATABASE_URL:
        return migrate_postgresql(engine)
    else:
        print("❌ Banco de dados não suportado")
        return

def migrate_sqlite(engine):
    """Migração para SQLite"""
    with engine.connect() as connection:
        # Verificar se a coluna já existe (SQLite)
        result = connection.execute(text("PRAGMA table_info(skills)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'created_by' in columns:
            print("✅ Coluna 'created_by' já existe na tabela skills")
            return
        
        print("🔧 Adicionando coluna 'created_by' na tabela skills (SQLite)...")
        
        # Adicionar coluna created_by
        connection.execute(text("""
            ALTER TABLE skills 
            ADD COLUMN created_by INTEGER NOT NULL DEFAULT 1
        """))
        
        connection.commit()
        print("✅ Migração SQLite concluída com sucesso!")

def migrate_postgresql(engine):
    """Migração para PostgreSQL"""
    with engine.connect() as connection:
        # Verificar se a coluna já existe (PostgreSQL)
        result = connection.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'skills' AND column_name = 'created_by'
        """))
        
        if result.fetchone():
            print("✅ Coluna 'created_by' já existe na tabela skills")
            return
        
        print("🔧 Adicionando coluna 'created_by' na tabela skills (PostgreSQL)...")
        
        # Adicionar coluna created_by
        connection.execute(text("""
            ALTER TABLE skills 
            ADD COLUMN created_by INTEGER NOT NULL DEFAULT 1
        """))
        
        # Adicionar foreign key constraint
        connection.execute(text("""
            ALTER TABLE skills 
            ADD CONSTRAINT fk_skills_created_by 
            FOREIGN KEY (created_by) REFERENCES users(id)
        """))
        
        connection.commit()
        print("✅ Migração PostgreSQL concluída com sucesso!")

if __name__ == "__main__":
    try:
        migrate_skills()
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        sys.exit(1)
