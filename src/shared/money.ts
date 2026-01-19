export class Money {
  private constructor(public readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new Error("Valor monetario invalido");
    }
    return new Money(cents);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    if (other.cents > this.cents) {
      throw new Error("Subtracao invalida para Money");
    }
    return new Money(this.cents - other.cents);
  }
}
