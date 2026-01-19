import { describe, it, expect } from "vitest";
import { Money } from "../../src/shared/money.js";

describe("Money", () => {
  describe("fromCents", () => {
    it("deve criar Money a partir de centavos validos", () => {
      const money = Money.fromCents(1500);
      expect(money.cents).toBe(1500);
    });

    it("deve rejeitar valores negativos", () => {
      expect(() => Money.fromCents(-100)).toThrow("Valor monetario invalido");
    });

    it("deve rejeitar valores nao inteiros", () => {
      expect(() => Money.fromCents(10.5)).toThrow("Valor monetario invalido");
    });

    it("deve aceitar zero", () => {
      const money = Money.fromCents(0);
      expect(money.cents).toBe(0);
    });
  });

  describe("add", () => {
    it("deve somar dois Money corretamente", () => {
      const a = Money.fromCents(1000);
      const b = Money.fromCents(500);
      const result = a.add(b);
      expect(result.cents).toBe(1500);
    });
  });

  describe("subtract", () => {
    it("deve subtrair dois Money corretamente", () => {
      const a = Money.fromCents(1500);
      const b = Money.fromCents(500);
      const result = a.subtract(b);
      expect(result.cents).toBe(1000);
    });

    it("deve rejeitar subtracao que resulta em negativo", () => {
      const a = Money.fromCents(500);
      const b = Money.fromCents(1000);
      expect(() => a.subtract(b)).toThrow("Subtracao invalida para Money");
    });

    it("deve permitir subtracao que resulta em zero", () => {
      const a = Money.fromCents(500);
      const b = Money.fromCents(500);
      const result = a.subtract(b);
      expect(result.cents).toBe(0);
    });
  });
});
