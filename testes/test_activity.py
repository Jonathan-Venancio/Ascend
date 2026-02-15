from datetime import datetime
from app.domain.activity import Activity

def main():
    # cria activity
    a = Activity(
        activity_id=1,
        user_id=10,
        skill_id=5,
        descricao="Estudo FastAPI",
        xp_ganho=20,
        moedas_ganhas=3
    )

    # print para debug (__repr__ é chamado automaticamente)
    print(a)

    # print individual das propriedades
    print("XP ganho:", a.xp_ganho)
    print("Moedas:", a.moedas_ganhas)
    print("Data:", a.data)

    # teste de validação
    try:
        b = Activity(activity_id=2, user_id=11, skill_id=6, xp_ganho=-5)
    except ValueError as e:
        print("Erro esperado:", e)

if __name__ == "__main__":
    main()
