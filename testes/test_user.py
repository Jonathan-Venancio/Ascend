from app.domain.user import User

def main():
    user = User(user_id=1, name="Jonathan")

    print("Usuário criado:")
    print(user)

    user.apply_progress(120, 5)

    print("\nApós atividade:")
    print(user)

    user.spend_coins(3)

    print("\nApós gastar moedas:")
    print(user)

if __name__ == "__main__":
    main()