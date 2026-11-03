import { describe, it, expect } from "vitest";
import {
  calculatePareto,
  extractParetoInputsFromOrders,
  calculateGiniCoefficient,
} from "../src/pareto.js";
import { createMockOrders } from "./fixtures/mock-orders.js";

describe("Pareto & Concentration Analytics", () => {
  it("calculates Pareto 80/20 distribution with accurate ranking and cumulative percentages", () => {
    const orders = createMockOrders();
    const productInputs = extractParetoInputsFromOrders(orders, "product");

    const pareto = calculatePareto({
      dimension: "product",
      items: productInputs,
      currency: "NGN",
      thresholdPercentage: 80,
    });

    expect(pareto.dimension).toBe("product");
    expect(pareto.thresholdPercentage).toBe(80);
    expect(pareto.totalRevenueMinorUnits).toBeGreaterThan(0);
    expect(pareto.totalContributors).toBe(productInputs.length);

    // Products are ranked descending
    for (let i = 1; i < pareto.contributors.length; i++) {
      expect(pareto.contributors[i - 1]!.revenueMinorUnits).toBeGreaterThanOrEqual(
        pareto.contributors[i]!.revenueMinorUnits
      );
      expect(pareto.contributors[i]!.cumulativePercentage).toBeGreaterThanOrEqual(
        pareto.contributors[i - 1]!.cumulativePercentage
      );
    }

    // Cumulative percentage of last contributor is 100%
    const last = pareto.contributors[pareto.contributors.length - 1];
    expect(last?.cumulativePercentage).toBe(100);

    // Vital few identification: first few that reach threshold
    expect(pareto.vitalContributorsCount).toBeGreaterThan(0);
    expect(pareto.vitalContributorsPercentage).toBeGreaterThan(0);
    expect(pareto.giniCoefficient).toBeGreaterThanOrEqual(0);
    expect(pareto.giniCoefficient).toBeLessThanOrEqual(1);
    expect(pareto.herfindahlHirschmanIndex).toBeGreaterThan(0);
  });

  it("does NOT assume that exactly 20% of contributors generate 80% of revenue", () => {
    // 5 contributors: 1 has 90%, 4 have 2.5% each
    const items = [
      { id: "p1", name: "Flagship", revenueMinorUnits: 90000 },
      { id: "p2", name: "Minor 1", revenueMinorUnits: 2500 },
      { id: "p3", name: "Minor 2", revenueMinorUnits: 2500 },
      { id: "p4", name: "Minor 3", revenueMinorUnits: 2500 },
      { id: "p5", name: "Minor 4", revenueMinorUnits: 2500 },
    ];

    const result = calculatePareto({
      dimension: "product",
      items,
      currency: "USD",
      thresholdPercentage: 80,
    });

    // Only 1 product generates 90% (which is >= 80% threshold)
    // 1 / 5 = 20%
    expect(result.vitalContributorsCount).toBe(1);
    expect(result.vitalContributorsPercentage).toBe(20);

    // Now test a 10-contributor set where 6 contributors are needed to reach 80% (60%)
    const equalSpread = Array.from({ length: 10 }, (_, i) => ({
      id: `item_${i + 1}`,
      name: `Item ${i + 1}`,
      revenueMinorUnits: 10000,
    }));

    const spreadResult = calculatePareto({
      dimension: "product",
      items: equalSpread,
      currency: "USD",
      thresholdPercentage: 80,
    });

    // Each is 10%, so 8 items are needed to reach 80%
    expect(spreadResult.vitalContributorsCount).toBe(8);
    expect(spreadResult.vitalContributorsPercentage).toBe(80);
  });

  it("calculates accurate Gini coefficients for equality and concentration", () => {
    // Perfect equality (all equal values) -> Gini = 0
    expect(calculateGiniCoefficient([100, 100, 100, 100])).toBe(0);

    // High inequality -> Gini close to 1
    const unequal = [1, 1, 1, 100000];
    const gini = calculateGiniCoefficient(unequal);
    expect(gini).toBeGreaterThan(0.7);

    // Empty or single element -> 0
    expect(calculateGiniCoefficient([])).toBe(0);
    expect(calculateGiniCoefficient([500])).toBe(0);
  });

  it("handles empty and single-contributor inputs safely", () => {
    const emptyResult = calculatePareto({
      dimension: "category",
      items: [],
      currency: "NGN",
    });
    expect(emptyResult.totalContributors).toBe(0);
    expect(emptyResult.vitalContributorsCount).toBe(0);
    expect(emptyResult.giniCoefficient).toBe(0);

    const singleResult = calculatePareto({
      dimension: "category",
      items: [{ id: "cat1", name: "Solo", revenueMinorUnits: 5000 }],
      currency: "NGN",
    });
    expect(singleResult.totalContributors).toBe(1);
    expect(singleResult.vitalContributorsCount).toBe(1);
    expect(singleResult.contributors[0]?.cumulativePercentage).toBe(100);
    expect(singleResult.contributors[0]?.isVitalFew).toBe(true);
  });
});
