#!/usr/bin/env python3
import random

def play():
    print("\n  Number Guessing Game")
    print("  --------------------")

    low, high = 1, 100
    secret = random.randint(low, high)
    attempts = 0
    max_attempts = 10

    print(f"  I'm thinking of a number between {low} and {high}.")
    print(f"  You have {max_attempts} attempts. Good luck!\n")

    while attempts < max_attempts:
        remaining = max_attempts - attempts
        try:
            guess = int(input(f"  Attempt {attempts + 1}/{max_attempts} — Enter your guess: "))
        except ValueError:
            print("  Please enter a valid number.\n")
            continue

        attempts += 1

        if guess < low or guess > high:
            print(f"  Out of range! Guess between {low} and {high}.\n")
            attempts -= 1
        elif guess < secret:
            print(f"  Too low!  ({remaining - 1} attempts left)\n")
        elif guess > secret:
            print(f"  Too high! ({remaining - 1} attempts left)\n")
        else:
            print(f"\n  Correct! The number was {secret}.")
            print(f"  You got it in {attempts} attempt{'s' if attempts != 1 else ''}!\n")
            return

    print(f"\n  Out of attempts! The number was {secret}. Better luck next time!\n")

if __name__ == "__main__":
    while True:
        play()
        again = input("  Play again? (y/n): ").strip().lower()
        if again != "y":
            print("\n  Thanks for playing!\n")
            break
