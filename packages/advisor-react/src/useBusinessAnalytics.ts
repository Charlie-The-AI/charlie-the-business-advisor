'use client';

import { useMemo } from 'react';
import type { Order, CurrencyCode, AnalyticsSnapshot } from '@charlie/advisor-types';
import { createAnalyticsSnapshot } from '@charlie/analytics-core';
import { useCharlieContext } from './context.js';

export interface UseBusinessAnalyticsOptions {
  currency?: CurrencyCode;
  timezone?: string;
  paretoThresholdPercentage?: number;
  businessId?: string;
  period?: {
    from?: string;
    to?: string;
  };
  previousPeriodOrders?: Order[];
}

export function useBusinessAnalytics(
  orders: Order[],
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

    const sorted = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstOrder = sorted[0];
    const lastOrder = sorted[sorted.length - 1];

    const from = options.period?.from || firstOrder?.createdAt || new Date().toISOString();
    const to = options.period?.to || lastOrder?.createdAt || new Date().toISOString();

    const snapshot: AnalyticsSnapshot = createAnalyticsSnapshot({
      businessId,
      currency,
      period: { from, to, timezone },
      orders,
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
    options.previousPeriodOrders,
    threshold,
    timezone,
    options.period?.from,
    options.period?.to,
  ]);

  return analytics;
}
