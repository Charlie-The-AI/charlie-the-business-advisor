import { describe, it, expect } from 'vitest';
import type { Order } from '@charlie/advisor-types';
import { calculateSalesSummary, calculatePareto, extractParetoInputsFromOrders } from '@charlie/analytics-core';

describe('Advisor React Library & Core Interop', () => {
  const mockOrders: Order[] = [
    {
      id: 'ord_1',
      status: 'completed',
      currency: 'NGN',
      createdAt: '2026-02-10T12:00:00Z',
      completedAt: '2026-02-10T12:30:00Z',
      subtotalMinorUnits: 10000000,
      totalMinorUnits: 10000000,
      discountMinorUnits: 0,
      taxMinorUnits: 0,
      shippingMinorUnits: 0,
      refundMinorUnits: 0,
      customerId: 'cust_1',
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          productName: '5kVA Solar Inverter',
          quantity: 1,
          unitPriceMinorUnits: 10000000,
          totalPriceMinorUnits: 10000000,
        },
      ],
    },
    {
      id: 'ord_2',
      status: 'completed',
      currency: 'NGN',
      createdAt: '2026-02-12T14:00:00Z',
      completedAt: '2026-02-12T14:15:00Z',
      subtotalMinorUnits: 2500000,
      totalMinorUnits: 2500000,
      discountMinorUnits: 0,
      taxMinorUnits: 0,
      shippingMinorUnits: 0,
      refundMinorUnits: 0,
      customerId: 'cust_2',
      items: [
        {
          id: 'item_2',
          productId: 'prod_2',
          productName: 'Solar Battery',
          quantity: 1,
          unitPriceMinorUnits: 2500000,
          totalPriceMinorUnits: 2500000,
        },
      ],
    },
  ];

  it('computes sales metrics deterministically with integer minor units', () => {
    const summary = calculateSalesSummary({ orders: mockOrders, currency: 'NGN' });

    expect(summary.totalCompletedOrders).toBe(2);
    expect(summary.netRevenueMinorUnits).toBe(12500000);
    expect(summary.netRevenueFormatted).toBe('₦125,000.00');
    expect(summary.averageOrderValueMinorUnits).toBe(6250000);
  });

  it('computes Pareto 80/20 distribution with vital contributor identification', () => {
    const inputs = extractParetoInputsFromOrders(mockOrders, 'product');
    const pareto = calculatePareto({
      items: inputs,
      dimension: 'product',
      currency: 'NGN',
      thresholdPercentage: 80,
    });

    expect(pareto.totalContributors).toBe(2);
    expect(pareto.vitalContributorsCount).toBe(1);
    expect(pareto.contributors[0].id).toBe('prod_1');
    expect(pareto.contributors[0].contributionPercentage).toBe(80);
    expect(pareto.contributors[0].isVitalFew).toBe(true);
  });
});
