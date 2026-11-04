'use client';

import { useMemo } from 'react';
import type { Order, CharlieOrder, Customer, CharlieCustomer, CurrencyCode, AnalyticsSnapshot } from '@charlie-the-ai/advisor-types';
import { createAnalyticsSnapshot } from '@charlie-the-ai/analytics-core';
import { useCharlieContext } from './context.js';

export interface UseBusinessAnalyticsOptions {
  currency?: CurrencyCode;
  timezone?: string;
  paretoThresholdPercentage?: number;
  businessId?: string;
  customers?: (Customer | CharlieCustomer)[];
  period?: {
    from?: string;
    to?: string;
  };
  previousPeriodOrders?: (Order | CharlieOrder)[];
}

export function useBusinessAnalytics(
  orders: (Order | CharlieOrder)[],
  options: UseBusinessAnalyticsOptions = {}
) {
  const context = useCharlieContext();
  const currency = options.currency || context.currency || 'NGN';
  const timezone = options.timezone || context.timezone || 'Africa/Lagos';
  const threshold = options.paretoThresholdPercentage ?? 80;
  const businessId = options.businessId || context.businessId || 'biz_client';

  const analytics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        sales: null,
        pareto: null,
        customers: null,
        products: null,
        trends: null,
        dataQuality: null,
        snapshot: null,
        hasData: false,
      };
    }

    const sorted = [...orders].sort((a, b) => {
      const timeA = new Date('placedAt' in a ? a.placedAt : a.createdAt).getTime();
      const timeB = new Date('placedAt' in b ? b.placedAt : b.createdAt).getTime();
      return timeA - timeB;
    });
    const firstOrder = sorted[0];
    const lastOrder = sorted[sorted.length - 1];

    const firstTime = firstOrder ? ('placedAt' in firstOrder ? firstOrder.placedAt : firstOrder.createdAt) : new Date().toISOString();
    const lastTime = lastOrder ? ('placedAt' in lastOrder ? lastOrder.placedAt : lastOrder.createdAt) : new Date().toISOString();

    const from = options.period?.from || firstTime;
    const to = options.period?.to || lastTime;

    const snapshot: AnalyticsSnapshot = createAnalyticsSnapshot({
      businessId,
      currency,
      period: { from, to, timezone },
      orders,
      customers: options.customers,
      previousPeriodOrders: options.previousPeriodOrders,
      paretoThreshold: threshold,
    });

    return {
      sales: snapshot.sales,
      pareto: snapshot.pareto.products,
      customers: snapshot.customers,
      products: snapshot.products,
      trends: snapshot.trends,
      dataQuality: snapshot.dataQuality,
      snapshot,
      hasData: true,
    };
  }, [
    orders,
    currency,
    businessId,
    options.customers,
    options.previousPeriodOrders,
    threshold,
    timezone,
    options.period?.from,
    options.period?.to,
  ]);

  return analytics;
}

/**
 * Convenient alias for useBusinessAnalytics.
 */
export const useCharlieAnalytics = useBusinessAnalytics;
