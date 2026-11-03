import { Order, SalesSummary, PeriodicSalesPoint, CurrencyCode } from "@charlie-the-ai/advisor-types";
import { Money } from "./money.js";

export interface CalculateSalesOptions {
  orders: Order[];
  currency: CurrencyCode;
  previousPeriodOrders?: Order[];
  granularity?: "day" | "week" | "month";
}

/**
 * Calculates deterministic sales analytics from standardized orders.
 */
export function calculateSalesSummary(options: CalculateSalesOptions): SalesSummary {
  const { orders, currency, previousPeriodOrders, granularity = "day" } = options;

  let grossSalesMinorUnits = 0;
  let netRevenueMinorUnits = 0;
  let totalDiscountsMinorUnits = 0;
  let totalTaxMinorUnits = 0;
  let totalShippingMinorUnits = 0;
  let totalRefundsMinorUnits = 0;

  let totalCompletedOrders = 0;
  let totalCancelledOrders = 0;
  let totalRefundedOrders = 0;
  let totalPendingOrders = 0;

  // Periodic breakdown accumulator: key -> { gross, net, count, aov }
  const periodicMap = new Map<
    string,
    { gross: number; net: number; count: number }
  >();

  for (const order of orders) {
    switch (order.status) {
      case "completed": {
        totalCompletedOrders++;
        const netOrderRevenue = Money.subtract(order.totalMinorUnits, order.refundMinorUnits ?? 0);
        netRevenueMinorUnits = Money.add(netRevenueMinorUnits, netOrderRevenue);
        grossSalesMinorUnits = Money.add(grossSalesMinorUnits, order.subtotalMinorUnits);
        totalDiscountsMinorUnits = Money.add(totalDiscountsMinorUnits, order.discountMinorUnits ?? 0);
        totalTaxMinorUnits = Money.add(totalTaxMinorUnits, order.taxMinorUnits ?? 0);
        totalShippingMinorUnits = Money.add(totalShippingMinorUnits, order.shippingMinorUnits ?? 0);
        totalRefundsMinorUnits = Money.add(totalRefundsMinorUnits, order.refundMinorUnits ?? 0);

        // Periodic breakdown
        const periodKey = extractPeriodKey(order.createdAt, granularity);
        const existing = periodicMap.get(periodKey) ?? { gross: 0, net: 0, count: 0 };
        existing.gross = Money.add(existing.gross, order.subtotalMinorUnits);
        existing.net = Money.add(existing.net, netOrderRevenue);
        existing.count++;
        periodicMap.set(periodKey, existing);
        break;
      }

      case "partially_refunded": {
        totalCompletedOrders++;
        const netOrderRevenue = Money.subtract(order.totalMinorUnits, order.refundMinorUnits ?? 0);
        netRevenueMinorUnits = Money.add(netRevenueMinorUnits, netOrderRevenue);
        grossSalesMinorUnits = Money.add(grossSalesMinorUnits, order.subtotalMinorUnits);
        totalDiscountsMinorUnits = Money.add(totalDiscountsMinorUnits, order.discountMinorUnits ?? 0);
        totalTaxMinorUnits = Money.add(totalTaxMinorUnits, order.taxMinorUnits ?? 0);
        totalShippingMinorUnits = Money.add(totalShippingMinorUnits, order.shippingMinorUnits ?? 0);
        totalRefundsMinorUnits = Money.add(totalRefundsMinorUnits, order.refundMinorUnits ?? 0);

        const periodKey = extractPeriodKey(order.createdAt, granularity);
        const existing = periodicMap.get(periodKey) ?? { gross: 0, net: 0, count: 0 };
        existing.gross = Money.add(existing.gross, order.subtotalMinorUnits);
        existing.net = Money.add(existing.net, netOrderRevenue);
        existing.count++;
        periodicMap.set(periodKey, existing);
        break;
      }

      case "refunded": {
        totalRefundedOrders++;
        totalRefundsMinorUnits = Money.add(totalRefundsMinorUnits, order.totalMinorUnits);
        break;
      }

      case "cancelled": {
        totalCancelledOrders++;
        break;
      }

      case "pending": {
        totalPendingOrders++;
        break;
      }

      default:
        break;
    }
  }

  // Average Order Value (AOV) = Net Revenue / Completed Orders
  const averageOrderValueMinorUnits =
    totalCompletedOrders > 0 ? Money.divide(netRevenueMinorUnits, totalCompletedOrders) : 0;

  // Convert periodic map to sorted array
  const periodicBreakdown: PeriodicSalesPoint[] = Array.from(periodicMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => {
      const aov = data.count > 0 ? Money.divide(data.net, data.count) : 0;
      return {
        period,
        grossSalesMinorUnits: data.gross,
        netRevenueMinorUnits: data.net,
        netRevenueFormatted: Money.format(data.net, currency),
        orderCount: data.count,
        averageOrderValueMinorUnits: aov,
        averageOrderValueFormatted: Money.format(aov, currency),
      };
    });

  // Calculate period-over-period growth rates if previous period orders provided
  let periodOverPeriodRevenueGrowthRate: number | null = null;
  let periodOverPeriodOrderGrowthRate: number | null = null;

  if (previousPeriodOrders && previousPeriodOrders.length > 0) {
    let prevNetRevenue = 0;
    let prevCompletedOrders = 0;

    for (const prevOrder of previousPeriodOrders) {
      if (prevOrder.status === "completed" || prevOrder.status === "partially_refunded") {
        prevCompletedOrders++;
        const netPrev = Money.subtract(prevOrder.totalMinorUnits, prevOrder.refundMinorUnits ?? 0);
        prevNetRevenue = Money.add(prevNetRevenue, netPrev);
      }
    }

    if (prevNetRevenue > 0) {
      const diff = Money.subtract(netRevenueMinorUnits, prevNetRevenue);
      periodOverPeriodRevenueGrowthRate = Math.round((diff / prevNetRevenue) * 10000) / 10000;
    }

    if (prevCompletedOrders > 0) {
      const orderDiff = totalCompletedOrders - prevCompletedOrders;
      periodOverPeriodOrderGrowthRate = Math.round((orderDiff / prevCompletedOrders) * 10000) / 10000;
    }
  }

  return {
    grossSalesMinorUnits,
    grossSalesFormatted: Money.format(grossSalesMinorUnits, currency),
    netRevenueMinorUnits,
    netRevenueFormatted: Money.format(netRevenueMinorUnits, currency),
    totalOrders: orders.length,
    totalCompletedOrders,
    totalCancelledOrders,
    totalRefundedOrders,
    totalPendingOrders,
    averageOrderValueMinorUnits,
    averageOrderValueFormatted: Money.format(averageOrderValueMinorUnits, currency),
    totalDiscountsMinorUnits,
    totalTaxMinorUnits,
    totalShippingMinorUnits,
    totalRefundsMinorUnits,
    periodOverPeriodRevenueGrowthRate,
    periodOverPeriodOrderGrowthRate,
    periodicBreakdown,
  };
}

function extractPeriodKey(isoDate: string, granularity: "day" | "week" | "month"): string {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  if (granularity === "day") {
    return `${year}-${month}-${day}`;
  }

  if (granularity === "month") {
    return `${year}-${month}`;
  }

  // Week: calculate ISO week
  const tempDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}
