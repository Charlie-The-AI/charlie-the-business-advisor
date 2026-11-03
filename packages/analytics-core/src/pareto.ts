import {
  ParetoDimension,
  ParetoResult,
  ParetoContributor,
  CurrencyCode,
  Order,
} from "@charlie/advisor-types";
import { Money } from "./money.js";

export interface ParetoItemInput {
  id: string;
  name: string;
  revenueMinorUnits: number;
}

export interface CalculateParetoOptions {
  dimension: ParetoDimension;
  items: ParetoItemInput[];
  currency: CurrencyCode;
  thresholdPercentage?: number; // Default 80
}

/**
 * Calculates Pareto (80/20 & Concentration) analysis on arbitrary dimensions.
 */
export function calculatePareto(options: CalculateParetoOptions): ParetoResult {
  const { dimension, items, currency, thresholdPercentage = 80 } = options;

  // Filter out non-positive revenue for distribution analysis
  const validItems = items.filter((item) => item.revenueMinorUnits > 0);

  if (validItems.length === 0) {
    return {
      dimension,
      thresholdPercentage,
      totalRevenueMinorUnits: 0,
      totalContributors: 0,
      vitalContributorsCount: 0,
      vitalContributorsPercentage: 0,
      giniCoefficient: 0,
      herfindahlHirschmanIndex: 0,
      contributors: [],
    };
  }

  // Sort descending by revenue, break ties alphabetically by name/id
  const sorted = [...validItems].sort((a, b) => {
    if (b.revenueMinorUnits !== a.revenueMinorUnits) {
      return b.revenueMinorUnits - a.revenueMinorUnits;
    }
    return a.id.localeCompare(b.id);
  });

  const totalRevenueMinorUnits = sorted.reduce(
    (sum, item) => Money.add(sum, item.revenueMinorUnits),
    0
  );

  let cumulativeRevenue = 0;
  let vitalCount = 0;
  let reachedThreshold = false;

  const contributors: ParetoContributor[] = sorted.map((item, index) => {
    cumulativeRevenue = Money.add(cumulativeRevenue, item.revenueMinorUnits);

    const contributionPct =
      totalRevenueMinorUnits > 0
        ? Math.round((item.revenueMinorUnits / totalRevenueMinorUnits) * 10000) / 100
        : 0;

    const cumulativePct =
      totalRevenueMinorUnits > 0
        ? Math.min(100, Math.round((cumulativeRevenue / totalRevenueMinorUnits) * 10000) / 100)
        : 0;

    let isVitalFew = false;
    if (!reachedThreshold) {
      isVitalFew = true;
      vitalCount++;
      if (cumulativePct >= thresholdPercentage) {
        reachedThreshold = true;
      }
    }

    return {
      id: item.id,
      name: item.name,
      revenueMinorUnits: item.revenueMinorUnits,
      revenueFormatted: Money.format(item.revenueMinorUnits, currency),
      contributionPercentage: contributionPct,
      cumulativePercentage: cumulativePct,
      rank: index + 1,
      isVitalFew,
    };
  });

  const totalContributors = contributors.length;
  const vitalContributorsPercentage =
    totalContributors > 0
      ? Math.round((vitalCount / totalContributors) * 10000) / 100
      : 0;

  // Calculate Gini Coefficient
  const gini = calculateGiniCoefficient(sorted.map((i) => i.revenueMinorUnits));

  // Calculate Herfindahl-Hirschman Index (HHI)
  // HHI = sum of (market_share_percentage)^2
  const hhi = Math.round(
    contributors.reduce((acc, c) => acc + Math.pow(c.contributionPercentage, 2), 0)
  );

  return {
    dimension,
    thresholdPercentage,
    totalRevenueMinorUnits,
    totalContributors,
    vitalContributorsCount: vitalCount,
    vitalContributorsPercentage,
    giniCoefficient: gini,
    herfindahlHirschmanIndex: Math.min(10000, hhi),
    contributors,
  };
}

/**
 * Derives Pareto input from Orders for a given dimension.
 */
export function extractParetoInputsFromOrders(
  orders: Order[],
  dimension: ParetoDimension
): ParetoItemInput[] {
  const map = new Map<string, { id: string; name: string; revenue: number }>();

  for (const order of orders) {
    if (order.status !== "completed" && order.status !== "partially_refunded") {
      continue;
    }

    if (dimension === "customer") {
      const customerId = order.customerId || (order.customerEmail ? `email:${order.customerEmail}` : null);
      if (!customerId) {
        continue;
      }
      const customerName = order.customerName || order.customerEmail || `Customer ${customerId}`;
      const netOrderRev = Money.subtract(order.totalMinorUnits, order.refundMinorUnits ?? 0);
      const existing = map.get(customerId) ?? { id: customerId, name: customerName, revenue: 0 };
      existing.revenue = Money.add(existing.revenue, netOrderRev);
      map.set(customerId, existing);
    } else {
      for (const item of order.items) {
        if (dimension === "product") {
          const key = item.productId;
          const existing = map.get(key) ?? { id: key, name: item.productName, revenue: 0 };
          existing.revenue = Money.add(existing.revenue, item.totalPriceMinorUnits);
          map.set(key, existing);
        } else if (dimension === "category") {
          const key = item.category || "Uncategorized";
          const existing = map.get(key) ?? { id: key, name: key, revenue: 0 };
          existing.revenue = Money.add(existing.revenue, item.totalPriceMinorUnits);
          map.set(key, existing);
        }
      }
    }
  }

  return Array.from(map.values()).map((v) => ({
    id: v.id,
    name: v.name,
    revenueMinorUnits: v.revenue,
  }));
}

/**
 * Calculates Gini coefficient on an array of non-negative values.
 * Values: 0 (perfect equality) to 1 (maximal inequality).
 */
export function calculateGiniCoefficient(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }

  // Sort ascending
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let sum = 0;
  let weightedSum = 0;

  for (let i = 0; i < n; i++) {
    const val = sorted[i]!;
    sum += val;
    weightedSum += (i + 1) * val;
  }

  if (sum === 0) {
    return 0;
  }

  // G = (2 * weightedSum) / (n * sum) - (n + 1) / n
  const gini = (2 * weightedSum) / (n * sum) - (n + 1) / n;
  return Math.min(1, Math.max(0, Math.round(gini * 1000) / 1000));
}
