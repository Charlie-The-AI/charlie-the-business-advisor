import { describe, it, expect } from "vitest";
import { Money } from "../src/money.js";

describe("Money & Decimal Arithmetic", () => {
  it("performs deterministic addition without floating-point errors", () => {
    // In IEEE-754 floating point: 0.1 + 0.2 = 0.30000000000000004
    // In minor units (10 + 20 = 30)
    const result = Money.add(10, 20);
    expect(result).toBe(30);

    const sum = Money.add(100000, 250050, 49950);
    expect(sum).toBe(400000);
  });

  it("performs deterministic subtraction", () => {
    const diff = Money.subtract(100000, 25000, 5000);
    expect(diff).toBe(70000);
  });

  it("performs multiplication with half-up rounding", () => {
    // 3 items @ ₦33.33 (3333 kobo) = 9999 kobo
    expect(Money.multiply(3333, 3)).toBe(9999);
    // 10 items @ ₦2.55 (255 kobo) with 10% discount (factor 0.9)
    expect(Money.multiply(2550, 0.9)).toBe(2295);
  });

  it("performs division with half-up rounding", () => {
    expect(Money.divide(100, 3)).toBe(33);
    expect(Money.divide(200, 3)).toBe(67);
    expect(Money.divide(100, 0)).toBe(0);
  });

  it("calculates percentage accurately", () => {
    expect(Money.percentage(25, 100)).toBe(25);
    expect(Money.percentage(1, 3, 2)).toBe(33.33);
    expect(Money.percentage(50, 0)).toBeNull();
  });

  it("formats currency accurately with proper symbols and separators", () => {
    // NGN (2 decimals, prefix ₦)
    expect(Money.format(2500000, "NGN")).toBe("₦25,000.00");
    expect(Money.format(-50000, "NGN")).toBe("₦-500.00");

    // USD (2 decimals, prefix $)
    expect(Money.format(1599, "USD")).toBe("$15.99");
    expect(Money.format(100000000, "USD")).toBe("$1,000,000.00");

    // JPY (0 decimals, prefix ¥)
    expect(Money.format(1500, "JPY")).toBe("¥1,500");

    // BHD (3 decimals, prefix BD)
    expect(Money.format(12500, "BHD")).toBe("BD12.500");
  });

  it("converts between major and minor units", () => {
    expect(Money.toMinorUnits(250.75, "NGN")).toBe(25075);
    expect(Money.toMajorUnits(25075, "NGN")).toBe(250.75);
    expect(Money.toMinorUnits(1500, "JPY")).toBe(1500);
    expect(Money.toMajorUnits(1500, "JPY")).toBe(1500);
  });
});
