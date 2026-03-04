import math


def get_number(prompt):
    """Read a number safely from user input."""
    while True:
        value = input(prompt).strip()
        try:
            return float(value)
        except ValueError:
            print("Invalid number. Please enter a valid numeric value.")


def print_menu():
    print("\n=== Advanced Calculator ===")
    print("1. Add (+)")
    print("2. Subtract (-)")
    print("3. Multiply (*)")
    print("4. Divide (/)")
    print("5. Power (x^y)")
    print("6. Square root (√x)")
    print("7. Modulus (x % y)")
    print("8. Factorial (x!)")
    print("9. Sine (sin x, degrees)")
    print("10. Cosine (cos x, degrees)")
    print("11. Tangent (tan x, degrees)")
    print("12. Log base 10 (log10 x)")
    print("13. Natural log (ln x)")
    print("0. Exit")


def calculate(choice):
    if choice in {"1", "2", "3", "4", "5", "7"}:
        a = get_number("Enter first number: ")
        b = get_number("Enter second number: ")

        if choice == "1":
            return a + b
        if choice == "2":
            return a - b
        if choice == "3":
            return a * b
        if choice == "4":
            if b == 0:
                raise ValueError("Division by zero is not allowed.")
            return a / b
        if choice == "5":
            return a**b
        if choice == "7":
            if b == 0:
                raise ValueError("Modulus by zero is not allowed.")
            return a % b

    elif choice in {"6", "8", "9", "10", "11", "12", "13"}:
        x = get_number("Enter number: ")

        if choice == "6":
            if x < 0:
                raise ValueError("Square root of a negative number is not real.")
            return math.sqrt(x)
        if choice == "8":
            if x < 0 or not x.is_integer():
                raise ValueError("Factorial is only defined for non-negative integers.")
            return math.factorial(int(x))
        if choice == "9":
            return math.sin(math.radians(x))
        if choice == "10":
            return math.cos(math.radians(x))
        if choice == "11":
            return math.tan(math.radians(x))
        if choice == "12":
            if x <= 0:
                raise ValueError("Log10 is only defined for x > 0.")
            return math.log10(x)
        if choice == "13":
            if x <= 0:
                raise ValueError("Natural log is only defined for x > 0.")
            return math.log(x)

    raise ValueError("Invalid menu choice.")


def main():
    while True:
        print_menu()
        choice = input("Choose an operation (0-13): ").strip()

        if choice == "0":
            print("Goodbye!")
            break

        try:
            result = calculate(choice)
            print(f"Result: {result}")
        except ValueError as error:
            print(f"Error: {error}")


if __name__ == "__main__":
    main()

