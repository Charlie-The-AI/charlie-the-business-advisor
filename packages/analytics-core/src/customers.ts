import {
  Order,
  CustomerAnalytics,
  RfmCustomerScore,
  RfmSegmentName,
  CustomerCohort,
  CurrencyCode,
} from "@charlie/advisor-types";
import { Money } from "./money.js";

export interface CalculateCustomerOptions {
  orders: Order[];
  currency: CurrencyCode;
  referenceDate?: Date; // Defaults to latest order date or now
}

interface CustomerAccumulator {
  customerId: string;
  name?: string;
  email?: string;
  firstOrderDate: Date;
  lastOrderDate: Date;
  completedOrdersCount: number;
  totalSpendMinorUnits: number;
  orderDates: Date[];
}

/**
 * Calculates comprehensive customer analytics including RFM segmentation and cohort retention.
 */
export function calculateCustomerAnalytics(options: CalculateCustomerOptions): CustomerAnalytics {
  const { orders, currency, referenceDate } = options;

  const dataWarnings: string[] = [];
  const customerMap = new Map<string, CustomerAccumulator>();
  let ordersWithoutCustomerId = 0;

  for (const order of orders) {
    if (order.status !== "completed" && order.status !== "partially_refunded") {
      continue;
    }

    const customerId = order.customerId || (order.customerEmail ? `email:${order.customerEmail}` : null);
    if (!customerId) {
      ordersWithoutCustomerId++;
      continue;
    }

    const orderDate = new Date(order.createdAt);
    const netOrderRev = Money.subtract(order.totalMinorUnits, order.refundMinorUnits ?? 0);

    const existing = customerMap.get(customerId);
    if (!existing) {
      customerMap.set(customerId, {
        customerId,
        name: order.customerName,
        email: order.customerEmail,
        firstOrderDate: orderDate,
        lastOrderDate: orderDate,
        completedOrdersCount: 1,
        totalSpendMinorUnits: netOrderRev,
        orderDates: [orderDate],
      });
    } else {
      existing.completedOrdersCount++;
      existing.totalSpendMinorUnits = Money.add(existing.totalSpendMinorUnits, netOrderRev);
      existing.orderDates.push(orderDate);
      if (orderDate < existing.firstOrderDate) {
        existing.firstOrderDate = orderDate;
      }
      if (orderDate > existing.lastOrderDate) {
        existing.lastOrderDate = orderDate;
      }
    }
  }

  const uniqueCustomersCount = customerMap.size;

  if (ordersWithoutCustomerId > 0) {
    dataWarnings.push(
      `${ordersWithoutCustomerId} completed order(s) lacked customer identifiers and were excluded from customer retention calculations.`
    );
  }

  // If no identifiable customers, return explicit insufficient data report
  if (uniqueCustomersCount === 0) {
    return {
      uniqueCustomersCount: 0,
      repeatCustomersCount: 0,
      newCustomersCount: 0,
      repeatPurchaseRatePercentage: null,
      averagePurchaseFrequency: null,
      averageRevenuePerCustomerMinorUnits: null,
      averageRevenuePerCustomerFormatted: null,
      averageCustomerRecencyDays: null,
      rfmSegments: [],
      cohorts: [],
      isInsufficientData: true,
      dataWarnings: [
        ...dataWarnings,
        "Insufficient customer identification data to calculate retention or RFM segments.",
      ],
    };
  }

  // Derive reference date (latest order date or supplied date)
  let maxOrderTime = 0;
  for (const cust of customerMap.values()) {
    if (cust.lastOrderDate.getTime() > maxOrderTime) {
      maxOrderTime = cust.lastOrderDate.getTime();
    }
  }
  const refDate = referenceDate ?? (maxOrderTime > 0 ? new Date(maxOrderTime) : new Date());

  let repeatCustomersCount = 0;
  let totalSpendSum = 0;
  let totalRecencyDaysSum = 0;
  const customersList = Array.from(customerMap.values());

  for (const cust of customersList) {
    if (cust.completedOrdersCount >= 2) {
      repeatCustomersCount++;
    }
    totalSpendSum = Money.add(totalSpendSum, cust.totalSpendMinorUnits);
    const recencyDays = Math.max(
      0,
      Math.floor((refDate.getTime() - cust.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    totalRecencyDaysSum += recencyDays;
  }

  const repeatPurchaseRatePercentage =
    uniqueCustomersCount > 0
      ? Math.round((repeatCustomersCount / uniqueCustomersCount) * 10000) / 100
      : 0;

  const totalCompletedOrders = customersList.reduce(
    (acc, curr) => acc + curr.completedOrdersCount,
    0
  );
  const averagePurchaseFrequency =
    uniqueCustomersCount > 0
      ? Math.round((totalCompletedOrders / uniqueCustomersCount) * 100) / 100
      : 0;

  const averageRevenuePerCustomerMinorUnits =
    uniqueCustomersCount > 0 ? Money.divide(totalSpendSum, uniqueCustomersCount) : 0;

  const averageCustomerRecencyDays =
    uniqueCustomersCount > 0
      ? Math.round((totalRecencyDaysSum / uniqueCustomersCount) * 10) / 10
      : 0;

  // Compute RFM Segmentation
  const rfmSegments = computeRfmSegments(customersList, refDate);

  // Compute Cohorts
  const cohorts = computeCohorts(customersList);

  return {
    uniqueCustomersCount,
    repeatCustomersCount,
    newCustomersCount: uniqueCustomersCount - repeatCustomersCount,
    repeatPurchaseRatePercentage,
    averagePurchaseFrequency,
    averageRevenuePerCustomerMinorUnits,
    averageRevenuePerCustomerFormatted: Money.format(
      averageRevenuePerCustomerMinorUnits,
      currency
    ),
    averageCustomerRecencyDays,
    rfmSegments,
    cohorts,
    isInsufficientData: false,
    dataWarnings,
  };
}

/**
 * Computes RFM scores (1 to 5) and assigns segments.
 */
function computeRfmSegments(
  customers: CustomerAccumulator[],
  refDate: Date
): RfmCustomerScore[] {
  const customerRecords = customers.map((c) => {
    const recencyDays = Math.max(
      0,
      Math.floor((refDate.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    return {
      customerId: c.customerId,
      customerName: c.name,
      customerEmail: c.email,
      recencyDays,
      frequency: c.completedOrdersCount,
      monetaryMinorUnits: c.totalSpendMinorUnits,
    };
  });

  // Calculate score boundaries using quantiles
  const recencies = customerRecords.map((c) => c.recencyDays).sort((a, b) => a - b);
  const frequencies = customerRecords.map((c) => c.frequency).sort((a, b) => a - b);
  const monetaries = customerRecords.map((c) => c.monetaryMinorUnits).sort((a, b) => a - b);

  return customerRecords.map((c) => {
    // Recency: Lower recencyDays is better (Score 5 = lowest days, Score 1 = highest days)
    const rScore = 6 - getQuantileScore(c.recencyDays, recencies);
    // Frequency: Higher is better
    const fScore = getQuantileScore(c.frequency, frequencies);
    // Monetary: Higher is better
    const mScore = getQuantileScore(c.monetaryMinorUnits, monetaries);

    const rfmScore = `${rScore}${fScore}${mScore}`;
    const segment = assignRfmSegment(rScore, fScore, mScore);

    return {
      customerId: c.customerId,
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      recencyDays: c.recencyDays,
      recencyScore: rScore,
      frequency: c.frequency,
      frequencyScore: fScore,
      monetaryMinorUnits: c.monetaryMinorUnits,
      monetaryScore: mScore,
      rfmScore,
      segment,
    };
  });
}

function getQuantileScore(val: number, sortedVals: number[]): number {
  if (sortedVals.length === 0) return 3;
  const index = sortedVals.indexOf(val);
  const percentile = index / sortedVals.length;

  if (percentile < 0.2) return 1;
  if (percentile < 0.4) return 2;
  if (percentile < 0.6) return 3;
  if (percentile < 0.8) return 4;
  return 5;
}

function assignRfmSegment(r: number, f: number, m: number): RfmSegmentName {
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 3 && f >= 3 && m >= 3) return "Loyal Customers";
  if (r >= 4 && f >= 2 && m >= 2) return "Potential Loyalists";
  if (r >= 4 && f === 1) return "Recent Customers";
  if (r >= 3 && f <= 2 && m <= 2) return "Promising";
  if (r === 3 && f >= 2) return "Need Attention";
  if (r === 2 && f <= 2) return "About to Sleep";
  if (r <= 2 && f >= 3 && m >= 3) return "At Risk";
  if (r <= 2 && f >= 4 && m >= 4) return "Cannot Lose Them";
  if (r <= 2 && f <= 2 && m <= 2) return "Hibernating";
  return "Lost";
}

/**
 * Computes cohort retention by first purchase calendar month.
 */
function computeCohorts(customers: CustomerAccumulator[]): CustomerCohort[] {
  // Map of cohortMonth -> customers in cohort
  const cohortMap = new Map<string, CustomerAccumulator[]>();

  for (const c of customers) {
    const cohortMonth = `${c.firstOrderDate.getUTCFullYear()}-${String(
      c.firstOrderDate.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    const existing = cohortMap.get(cohortMonth) ?? [];
    existing.push(c);
    cohortMap.set(cohortMonth, existing);
  }

  const cohorts: CustomerCohort[] = [];

  for (const [cohortMonth, cohortCustomers] of Array.from(cohortMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const cohortSize = cohortCustomers.length;
    const [cYear, cMonth] = cohortMonth.split("-").map(Number);
    const originCohortDate = new Date(Date.UTC(cYear!, cMonth! - 1, 1));

    // Determine max month index among cohort orders
    let maxMonthOffset = 0;
    for (const cust of cohortCustomers) {
      for (const d of cust.orderDates) {
        const offset =
          (d.getUTCFullYear() - originCohortDate.getUTCFullYear()) * 12 +
          (d.getUTCMonth() - originCohortDate.getUTCMonth());
        if (offset > maxMonthOffset) {
          maxMonthOffset = offset;
        }
      }
    }

    const retention = [];
    for (let monthIndex = 0; monthIndex <= Math.min(12, maxMonthOffset); monthIndex++) {
      let activeCustomers = 0;
      for (const cust of cohortCustomers) {
        const hasOrderInMonth = cust.orderDates.some((d) => {
          const offset =
            (d.getUTCFullYear() - originCohortDate.getUTCFullYear()) * 12 +
            (d.getUTCMonth() - originCohortDate.getUTCMonth());
          return offset === monthIndex;
        });
        if (hasOrderInMonth) {
          activeCustomers++;
        }
      }

      const retentionRatePercentage =
        cohortSize > 0 ? Math.round((activeCustomers / cohortSize) * 10000) / 100 : 0;

      retention.push({
        monthIndex,
        activeCustomers,
        retentionRatePercentage,
      });
    }

    cohorts.push({
      cohortMonth,
      cohortSize,
      retention,
    });
  }

  return cohorts;
}
