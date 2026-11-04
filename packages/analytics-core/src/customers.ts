import {
  Order,
  CharlieOrder,
  Customer,
  CharlieCustomer,
  CustomerAnalytics,
  RfmCustomerScore,
  RfmSegmentName,
  CustomerCohort,
  CurrencyCode,
} from "@charlie-the-ai/advisor-types";
import { Money } from "./money.js";
import { ensureCharlieOrders, ensureCharlieCustomers } from "./normalize.js";

export interface CalculateCustomerOptions {
  orders: (Order | CharlieOrder)[];
  currency: CurrencyCode;
  customers?: (Customer | CharlieCustomer)[];
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
  const { currency, referenceDate } = options;
  const orders = ensureCharlieOrders(options.orders);
  const registeredCustomers = ensureCharlieCustomers(options.customers);

  const dataWarnings: string[] = [];
  const customerMap = new Map<string, CustomerAccumulator>();
  let ordersWithoutCustomerId = 0;

  // Pre-seed known customer profiles if provided
  const customerMetaMap = new Map<string, CharlieCustomer>();
  for (const c of registeredCustomers) {
    customerMetaMap.set(c.id, c);
    customerMap.set(c.id, {
      customerId: c.id,
      name: c.name,
      email: c.email,
      firstOrderDate: new Date(0),
      lastOrderDate: new Date(0),
      completedOrdersCount: 0,
      totalSpendMinorUnits: 0,
      orderDates: [],
    });
  }

  for (const order of orders) {
    if (order.status !== "completed" && order.status !== "partially_refunded") {
      continue;
    }

    const customerId = order.customerId;
    if (!customerId) {
      ordersWithoutCustomerId++;
      continue;
    }

    const orderDate = new Date(order.placedAt);
    const netOrderRev = Money.subtract(order.totalMinor, order.refundedMinor ?? 0);
    const meta = customerMetaMap.get(customerId);

    const existing = customerMap.get(customerId);
    if (!existing || existing.completedOrdersCount === 0) {
      customerMap.set(customerId, {
        customerId,
        name: meta?.name ?? existing?.name,
        email: meta?.email ?? existing?.email,
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
  const purchasingCustomers = Array.from(customerMap.values()).filter(
    (c) => c.completedOrdersCount > 0
  );
  const uniquePurchasingCount = purchasingCustomers.length;

  if (ordersWithoutCustomerId > 0) {
    dataWarnings.push(
      `${ordersWithoutCustomerId} completed order(s) lacked customer identifiers and were excluded from customer retention calculations.`
    );
  }

  // If no identifiable purchasing customers, return explicit insufficient data report
  if (uniquePurchasingCount === 0) {
    return {
      uniqueCustomersCount,
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
  for (const cust of purchasingCustomers) {
    if (cust.lastOrderDate.getTime() > maxOrderTime) {
      maxOrderTime = cust.lastOrderDate.getTime();
    }
  }
  const refDate = referenceDate ?? (maxOrderTime > 0 ? new Date(maxOrderTime) : new Date());

  let repeatCustomersCount = 0;
  let totalSpendSum = 0;
  let totalRecencyDaysSum = 0;

  for (const cust of purchasingCustomers) {
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
    uniquePurchasingCount > 0
      ? Math.round((repeatCustomersCount / uniquePurchasingCount) * 10000) / 100
      : 0;

  const totalCompletedOrders = purchasingCustomers.reduce(
    (acc, curr) => acc + curr.completedOrdersCount,
    0
  );
  const averagePurchaseFrequency =
    uniquePurchasingCount > 0
      ? Math.round((totalCompletedOrders / uniquePurchasingCount) * 100) / 100
      : 0;

  const averageRevenuePerCustomerMinorUnits =
    uniquePurchasingCount > 0 ? Money.divide(totalSpendSum, uniquePurchasingCount) : 0;

  const averageCustomerRecencyDays =
    uniquePurchasingCount > 0
      ? Math.round(totalRecencyDaysSum / uniquePurchasingCount)
      : 0;

  // Compute RFM Scores across purchasing customers
  const rfmSegments = computeRfmScores(purchasingCustomers, refDate);

  // Generate monthly customer retention cohorts
  const cohorts = generateCohorts(purchasingCustomers);

  return {
    uniqueCustomersCount,
    repeatCustomersCount,
    newCustomersCount: uniquePurchasingCount - repeatCustomersCount,
    repeatPurchaseRatePercentage,
    averagePurchaseFrequency,
    averageRevenuePerCustomerMinorUnits,
    averageRevenuePerCustomerFormatted: Money.format(averageRevenuePerCustomerMinorUnits, currency),
    averageCustomerRecencyDays,
    rfmSegments,
    cohorts,
    isInsufficientData: false,
    dataWarnings,
  };
}

/**
 * Computes Quintile-based (1-5) RFM scores for each customer.
 */
function computeRfmScores(
  customers: CustomerAccumulator[],
  refDate: Date
): RfmCustomerScore[] {
  const n = customers.length;
  if (n === 0) return [];

  // Calculate raw metrics
  const rawList = customers.map((c) => {
    const recencyDays = Math.max(
      0,
      Math.floor((refDate.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    return {
      customer: c,
      recencyDays,
      frequency: c.completedOrdersCount,
      monetary: c.totalSpendMinorUnits,
    };
  });

  // Assign quintile scores (1 to 5)
  const sortedByR = [...rawList].sort((a, b) => a.recencyDays - b.recencyDays);
  const rScoreMap = new Map<string, number>();
  sortedByR.forEach((item, index) => {
    const q = 5 - Math.min(4, Math.floor((index / n) * 5));
    rScoreMap.set(item.customer.customerId, q);
  });

  const sortedByF = [...rawList].sort((a, b) => a.frequency - b.frequency);
  const fScoreMap = new Map<string, number>();
  sortedByF.forEach((item, index) => {
    const q = Math.min(5, Math.floor((index / n) * 5) + 1);
    fScoreMap.set(item.customer.customerId, q);
  });

  const sortedByM = [...rawList].sort((a, b) => a.monetary - b.monetary);
  const mScoreMap = new Map<string, number>();
  sortedByM.forEach((item, index) => {
    const q = Math.min(5, Math.floor((index / n) * 5) + 1);
    mScoreMap.set(item.customer.customerId, q);
  });

  return rawList.map((item) => {
    const r = rScoreMap.get(item.customer.customerId) ?? 3;
    const f = fScoreMap.get(item.customer.customerId) ?? 3;
    const m = mScoreMap.get(item.customer.customerId) ?? 3;
    const segment = assignRfmSegment(r, f, m);

    return {
      customerId: item.customer.customerId,
      customerName: item.customer.name,
      customerEmail: item.customer.email,
      recencyDays: item.recencyDays,
      recencyScore: r,
      frequency: item.frequency,
      frequencyScore: f,
      monetaryMinorUnits: item.monetary,
      monetaryScore: m,
      rfmScore: `${r}${f}${m}`,
      segment,
    };
  });
}

function assignRfmSegment(r: number, f: number, m: number): RfmSegmentName {
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 3 && f >= 3) return "Loyal Customers";
  if (r >= 4 && f <= 2) return "Potential Loyalists";
  if (r >= 4 && f === 1) return "Recent Customers";
  if (r === 3 && f <= 2) return "Promising";
  if (r === 3 && f >= 3) return "Need Attention";
  if (r === 2 && f <= 2) return "About to Sleep";
  if (r <= 2 && f >= 2 && m >= 2) return "At Risk";
  if (r <= 1 && f >= 4) return "Cannot Lose Them";
  if (r <= 2 && f <= 2) return "Hibernating";
  return "Lost";
}

function generateCohorts(customers: CustomerAccumulator[]): CustomerCohort[] {
  const cohortMap = new Map<string, { size: number; activeMonth1: number; activeMonth3: number }>();

  for (const c of customers) {
    if (c.firstOrderDate.getTime() === 0) continue;
    const cohortKey = `${c.firstOrderDate.getUTCFullYear()}-${String(
      c.firstOrderDate.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    const existing = cohortMap.get(cohortKey) ?? { size: 0, activeMonth1: 0, activeMonth3: 0 };
    existing.size++;

    const firstTime = c.firstOrderDate.getTime();
    for (const d of c.orderDates) {
      const daysDiff = (d.getTime() - firstTime) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 28 && daysDiff <= 62) {
        existing.activeMonth1 = 1;
      }
      if (daysDiff >= 85 && daysDiff <= 120) {
        existing.activeMonth3 = 1;
      }
    }

    cohortMap.set(cohortKey, existing);
  }

  return Array.from(cohortMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([cohortMonth, data]) => ({
      cohortMonth,
      cohortSize: data.size,
      retention: [
        {
          monthIndex: 0,
          activeCustomers: data.size,
          retentionRatePercentage: 100,
        },
        {
          monthIndex: 1,
          activeCustomers: data.activeMonth1,
          retentionRatePercentage:
            data.size > 0 ? Math.round((data.activeMonth1 / data.size) * 10000) / 100 : 0,
        },
        {
          monthIndex: 3,
          activeCustomers: data.activeMonth3,
          retentionRatePercentage:
            data.size > 0 ? Math.round((data.activeMonth3 / data.size) * 10000) / 100 : 0,
        },
      ],
    }));
}
