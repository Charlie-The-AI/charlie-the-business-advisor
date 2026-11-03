import {
  AnalyticsSnapshot,
  Order,
  CurrencyCode,
  DataQualityReport,
} from "@charlie/advisor-types";
import { calculateSalesSummary } from "./sales.js";
import { calculatePareto, extractParetoInputsFromOrders } from "./pareto.js";
import { calculateCustomerAnalytics } from "./customers.js";
import { calculateProductAnalytics } from "./products.js";
import { calculateTrends } from "./trends.js";

export interface CreateSnapshotOptions {
  businessId: string;
  currency: CurrencyCode;
  period: {
    from: string;
    to: string;
    timezone?: string;
  };
  orders: Order[];
  previousPeriodOrders?: Order[];
  paretoThreshold?: number;
}

/**
 * Creates a deterministic, standardized, versioned AnalyticsSnapshot.
 */
export function createAnalyticsSnapshot(options: CreateSnapshotOptions): AnalyticsSnapshot {
  const {
    businessId,
    currency,
    period,
    orders,
    previousPeriodOrders,
    paretoThreshold = 80,
  } = options;

  // 1. Calculate Sales
  const sales = calculateSalesSummary({
    orders,
    currency,
    previousPeriodOrders,
    granularity: "day",
  });

  // 2. Calculate Pareto for Products, Customers, Categories
  const productParetoInputs = extractParetoInputsFromOrders(orders, "product");
  const customerParetoInputs = extractParetoInputsFromOrders(orders, "customer");
  const categoryParetoInputs = extractParetoInputsFromOrders(orders, "category");

  const productPareto = calculatePareto({
    dimension: "product",
    items: productParetoInputs,
    currency,
    thresholdPercentage: paretoThreshold,
  });

  const customerPareto = calculatePareto({
    dimension: "customer",
    items: customerParetoInputs,
    currency,
    thresholdPercentage: paretoThreshold,
  });

  const categoryPareto = calculatePareto({
    dimension: "category",
    items: categoryParetoInputs,
    currency,
    thresholdPercentage: paretoThreshold,
  });

  // 3. Calculate Customer Metrics
  const customers = calculateCustomerAnalytics({
    orders,
    currency,
    referenceDate: new Date(period.to),
  });

  // 4. Calculate Product Metrics
  const products = calculateProductAnalytics({
    orders,
    currency,
  });

  // 5. Calculate Trends & Anomalies
  const trends = calculateTrends({
    periodicSales: sales.periodicBreakdown,
    currency,
  });

  // 6. Data Quality Evaluation
  const warnings: string[] = [...customers.dataWarnings];
  const missingFields: string[] = [];

  let missingCustomerCount = 0;
  let missingCostItemsCount = 0;
  let totalRecordsEvaluated = orders.length;

  for (const o of orders) {
    if (!o.customerId && !o.customerEmail) {
      missingCustomerCount++;
    }
    for (const item of o.items) {
      totalRecordsEvaluated++;
      if (item.unitCostMinorUnits === undefined && item.totalCostMinorUnits === undefined) {
        missingCostItemsCount++;
      }
    }
  }

  if (missingCustomerCount > 0) {
    missingFields.push("customerId");
  }
  if (missingCostItemsCount > 0) {
    missingFields.push("unitCostMinorUnits");
    warnings.push(
      `${missingCostItemsCount} order line item(s) lacked cost information. Gross profit calculations reflect only tracked items.`
    );
  }

  // Calculate Data Quality Score (0 - 100)
  let qualityDeduction = 0;
  if (orders.length > 0) {
    qualityDeduction += (missingCustomerCount / orders.length) * 30; // Max 30% penalty
  }
  if (products.totalProductsSold > 0) {
    qualityDeduction += (products.missingCostProductCount / products.totalProductsSold) * 30; // Max 30% penalty
  }
  const scorePercentage = Math.max(0, Math.round(100 - qualityDeduction));

  const dataQuality: DataQualityReport = {
    totalOrdersAnalyzed: orders.length,
    totalRecordsEvaluated,
    missingCustomerIdentifiersCount: missingCustomerCount,
    missingCostItemsCount,
    warnings,
    missingFields,
    scorePercentage,
  };

  const createdAt = new Date().toISOString();

  // Generate deterministic snapshot ID
  const payloadToHash = JSON.stringify({
    schemaVersion: "1.0.0",
    calculationVersion: "1.0.0",
    businessId,
    currency,
    period,
    totalOrders: orders.length,
    netRevenueMinorUnits: sales.netRevenueMinorUnits,
  });
  const snapshotId = generateDeterministicHash(payloadToHash);

  return {
    schemaVersion: "1.0.0",
    calculationVersion: "1.0.0",
    snapshotId,
    businessId,
    currency,
    createdAt,
    period: {
      from: period.from,
      to: period.to,
      timezone: period.timezone ?? "UTC",
    },
    sales,
    pareto: {
      products: productPareto,
      customers: customerPareto,
      categories: categoryPareto,
    },
    customers,
    products,
    trends,
    dataQuality,
  };
}

/**
 * Deterministic hash generator compatible across Node, browser, and edge runtimes.
 * Generates an 8-to-16 byte hex string from string input.
 */
function generateDeterministicHash(input: string): string {
  let hash1 = 0xdeadbeef ^ 0;
  let hash2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  const part1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `snap_${part1}${part2}`;
}
