# Entidades do sistema

## 🎮 Entidade: Usuário

Representa o jogador do sistema.

### Campos:

- id
- nome
- xp_total
- nível
- moedas
- created_at
- updated_at

### Regras:

- XP nunca diminui
- moedas nunca ficam negativas
- nível é derivado do XP
- toda mudança de XP recalcula nível

### Responsabilidades:

- acumular XP
- acumular moedas
- gastar moedas
- subir de nível

👉 Usuário é o centro do sistema.



## 📘 Entidade: Atividade

### Campos:

- id
- user_id
- skill_id ← novo campo
- tipo
- descricao
- xp_ganho
- moedas_ganhas
- data

### Agora cada atividade pertence a:

👉 um usuário
👉 uma skill

### Isso permite:

- XP por skill
- progresso por área
- estatísticas
- gráfico por árvore

Você acabou de criar um sistema muito mais poderoso.


## 📘 Entidade: Skill

Representa uma área de conhecimento.

### Campos:

- id
- nome
- descricao
- parent_id (nullable)
- user_id
- created_at

### Explicação:

- parent_id permite árvore infinita
- skill sem parent = raiz
- skill com parent = subskill

### Exemplo:

Python (parent null)
→ FastAPI (parent Python)
→ Segurança FastAPI (parent FastAPI)

Isso é uma árvore recursiva.

Você não precisa criar tabela extra.

Uma tabela se referencia.

Isso é padrão profissional pra árvore.


## 🏪 Entidade: Recompensa

Item comprável.

### Campos:

- id
- nome
- custo_moedas
- ativo (bool)

### Regras:

- só pode comprar se tiver moedas suficientes
- recompensa não gera XP
- custo nunca negativo

👉 É um catálogo.


## 🧾 Entidade: Compra de Recompensa

É preciso separar:

👉 recompensa disponível
👉 recompensa comprada

### Campos:

- id
- user_id
- recompensa_id
- custo_pago
- data_compra

### Regras:

- moedas são descontadas
- registro é permanente
- histórico não pode ser apagado

👉 Isso permite estatísticas depois.


## 🧠 Entidade opcional (mas recomendada): Configuração

Permite mudar regras sem mexer código.

### Campos:

- tipo_atividade
- xp_padrao
- moedas_padrao

### Exemplo:

"estudo_30min" → 15 XP, 2 moedas

👉 Isso transforma seu sistema em configurável.


## 🔁 Regras de negócio centrais

Isso é o verdadeiro coração do sistema.

### Quando registrar atividade:

- criar atividade
- somar XP no usuário
- somar moedas no usuário
- recalcular nível
- salvar tudo

### Quando comprar recompensa:

- verificar saldo
- descontar moedas
- registrar compra
- Sem exceções.
- Simples. Determinístico.







