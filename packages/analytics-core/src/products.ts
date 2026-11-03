import {
  Order,
  ProductAnalytics,
  ProductPerformanceItem,
  CategoryPerformanceItem,
  CurrencyCode,
} from "@charlie-the-ai/advisor-types";
import { Money } from "./money.js";

export interface CalculateProductOptions {
  orders: Order[];
  currency: CurrencyCode;
}

interface ProductAccumulator {
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  revenueMinorUnits: number;
  totalCostMinorUnits: number;
  hasCost: boolean;
}

interface CategoryAccumulator {
  category: string;
  unitsSold: number;
  revenueMinorUnits: number;
}

/**
 * Calculates deterministic product and category analytics.
 */
export function calculateProductAnalytics(options: CalculateProductOptions): ProductAnalytics {
  const { orders, currency } = options;

  const productMap = new Map<string, ProductAccumulator>();
  const categoryMap = new Map<string, CategoryAccumulator>();

  let totalProductsSold = 0;
  let totalUnitsSold = 0;
  let totalRevenueMinorUnits = 0;

  for (const order of orders) {
    if (order.status !== "completed" && order.status !== "partially_refunded") {
      continue;
    }

    for (const item of order.items) {
      totalUnitsSold += item.quantity;
      totalRevenueMinorUnits = Money.add(totalRevenueMinorUnits, item.totalPriceMinorUnits);

      // Product tracking
      const pKey = item.productId;
      const existingProduct = productMap.get(pKey);
      const hasItemCost = item.unitCostMinorUnits !== undefined || item.totalCostMinorUnits !== undefined;
      const itemCost =
        item.totalCostMinorUnits ??
        (item.unitCostMinorUnits ? Money.multiply(item.unitCostMinorUnits, item.quantity) : 0);

      if (!existingProduct) {
        totalProductsSold++;
        productMap.set(pKey, {
          productId: pKey,
          productName: item.productName,
          category: item.category || "Uncategorized",
          unitsSold: item.quantity,
          revenueMinorUnits: item.totalPriceMinorUnits,
          totalCostMinorUnits: itemCost,
          hasCost: hasItemCost,
        });
      } else {
        existingProduct.unitsSold += item.quantity;
        existingProduct.revenueMinorUnits = Money.add(
          existingProduct.revenueMinorUnits,
          item.totalPriceMinorUnits
        );
        if (hasItemCost) {
          existingProduct.totalCostMinorUnits = Money.add(
            existingProduct.totalCostMinorUnits,
            itemCost
          );
        } else {
          existingProduct.hasCost = false; // Mark incomplete if any line item lacked cost
        }
      }

      // Category tracking
      const catKey = item.category || "Uncategorized";
      const existingCat = categoryMap.get(catKey);
      if (!existingCat) {
        categoryMap.set(catKey, {
          category: catKey,
          unitsSold: item.quantity,
          revenueMinorUnits: item.totalPriceMinorUnits,
        });
      } else {
        existingCat.unitsSold += item.quantity;
        existingCat.revenueMinorUnits = Money.add(
          existingCat.revenueMinorUnits,
          item.totalPriceMinorUnits
        );
      }
    }
  }

  const allProducts = Array.from(productMap.values());
  let trackedProductsWithCostCount = 0;
  let missingCostProductCount = 0;
  let totalGrossProfitSum = 0;
  let totalTrackedCostRevenue = 0;

  const productPerformanceItems: ProductPerformanceItem[] = allProducts.map((p) => {
    const revenuePercentage =
      totalRevenueMinorUnits > 0
        ? Math.round((p.revenueMinorUnits / totalRevenueMinorUnits) * 10000) / 100
        : 0;

    let grossProfitMinorUnits: number | null = null;
    let grossProfitFormatted: string | null = null;
    let grossMarginPercentage: number | null = null;

    if (p.hasCost) {
      trackedProductsWithCostCount++;
      grossProfitMinorUnits = Money.subtract(p.revenueMinorUnits, p.totalCostMinorUnits);
      grossProfitFormatted = Money.format(grossProfitMinorUnits, currency);
      grossMarginPercentage =
        p.revenueMinorUnits > 0
          ? Math.round((grossProfitMinorUnits / p.revenueMinorUnits) * 10000) / 100
          : 0;

      totalGrossProfitSum = Money.add(totalGrossProfitSum, grossProfitMinorUnits);
      totalTrackedCostRevenue = Money.add(totalTrackedCostRevenue, p.revenueMinorUnits);
    } else {
      missingCostProductCount++;
    }

    return {
      productId: p.productId,
      productName: p.productName,
      category: p.category,
      unitsSold: p.unitsSold,
      revenueMinorUnits: p.revenueMinorUnits,
      revenueFormatted: Money.format(p.revenueMinorUnits, currency),
      revenuePercentage,
      grossProfitMinorUnits,
      grossProfitFormatted,
      grossMarginPercentage,
      hasCostData: p.hasCost,
    };
  });

  // Sort best sellers by revenue
  const bestSellersByRevenue = [...productPerformanceItems]
    .sort((a, b) => b.revenueMinorUnits - a.revenueMinorUnits)
    .slice(0, 10);

  // Sort best sellers by volume (units sold)
  const bestSellersByUnits = [...productPerformanceItems]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  // Sort worst performers by revenue
  const worstPerformersByRevenue = [...productPerformanceItems]
    .sort((a, b) => a.revenueMinorUnits - b.revenueMinorUnits)
    .slice(0, 10);

  // Categories breakdown
  const categories: CategoryPerformanceItem[] = Array.from(categoryMap.values())
    .map((c) => ({
      category: c.category,
      unitsSold: c.unitsSold,
      revenueMinorUnits: c.revenueMinorUnits,
      revenueFormatted: Money.format(c.revenueMinorUnits, currency),
      revenuePercentage:
        totalRevenueMinorUnits > 0
          ? Math.round((c.revenueMinorUnits / totalRevenueMinorUnits) * 10000) / 100
          : 0,
    }))
    .sort((a, b) => b.revenueMinorUnits - a.revenueMinorUnits);

  // Overall margin: only computed if at least one product has cost data
  const hasAnyCostData = trackedProductsWithCostCount > 0;
  const totalGrossProfitMinorUnits = hasAnyCostData ? totalGrossProfitSum : null;
  const totalGrossProfitFormatted = hasAnyCostData
    ? Money.format(totalGrossProfitSum, currency)
    : null;
  const overallGrossMarginPercentage =
    hasAnyCostData && totalTrackedCostRevenue > 0
      ? Math.round((totalGrossProfitSum / totalTrackedCostRevenue) * 10000) / 100
      : null;

  return {
    bestSellersByRevenue,
    bestSellersByUnits,
    worstPerformersByRevenue,
    categories,
    totalProductsSold,
    totalUnitsSold,
    trackedProductsWithCostCount,
    missingCostProductCount,
    totalGrossProfitMinorUnits,
    totalGrossProfitFormatted,
    overallGrossMarginPercentage,
  };
}
