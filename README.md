# ASCEND - Sistema de Gamificação

## MVP Implementado

Sistema completo de gamificação para evolução pessoal seguindo arquitetura em camadas.

## 🏗️ Estrutura do Projeto

```
Ascend/
├── app/
│   ├── domain/          # Regras de negócio
│   │   ├── user.py      # Entidade User
│   │   ├── activity.py  # Entidade Activity  
│   │   └── reward.py    # Entidades Reward e Purchase
│   ├── services/        # Lógica de negócio
│   │   ├── activity_service.py  # Registro de atividades
│   │   └── reward_service.py    # Compra de recompensas
│   ├── repositories/    # Interfaces de persistência
│   │   └── interfaces.py        # Protocolos Python
│   ├── database/        # Implementação SQLite
│   │   └── sqlite_repositories.py
│   └── api/            # FastAPI
│       ├── schemas.py   # Pydantic models
│       └── endpoints.py # Rotas da API
├── main.py             # Ponto de entrada
└── requirements.txt    # Dependências
```

## 🚀 Como Executar

1. Instalar dependências:
```bash
pip install -r requirements.txt
```

2. Iniciar servidor:
```bash
python main.py
```

A API estará disponível em `http://localhost:8000`

## 📡 Endpoints da API

### Criar Usuário
```
POST /api/v1/users?name=NomeDoUsuario&user_id=1
```

### Registrar Atividade
```
POST /api/v1/activities
Content-Type: application/json

{
  "user_id": 1,
  "skill_id": 1,
  "xp_gain": 50,
  "coins_gain": 10,
  "description": "Estudou Python por 2 horas"
}
```

### Comprar Recompensa
```
POST /api/v1/rewards/{reward_id}/purchase?user_id=1
```

### Obter Dashboard do Usuário
```
GET /api/v1/users/{user_id}
```

## 🎮 Funcionalidades Implementadas

- ✅ Registro de atividades com ganho de XP e moedas
- ✅ Sistema de níveis automáticos (100 XP por nível)
- ✅ Compra de recompensas com validação de moedas
- ✅ Persistência em SQLite
- ✅ API RESTful com FastAPI
- ✅ Arquitetura limpa e separação de responsabilidades

## 🏆 Recompensas Disponíveis

1. Livro Novo - 50 moedas
2. Café Especial - 30 moedas  
3. Dia de Folga - 100 moedas
4. Jogo Novo - 200 moedas
5. Curso Online - 150 moedas

## 🧪 Teste Rápido

1. Inicie o servidor
2. Crie um usuário: `POST /api/v1/users?name=Player&user_id=1`
3. Registre uma atividade: `POST /api/v1/activities` com JSON de exemplo
4. Verifique o progresso: `GET /api/v1/users/1`
5. Compre uma recompensa: `POST /api/v1/rewards/1/purchase?user_id=1`

O sistema está pronto para evolução!
