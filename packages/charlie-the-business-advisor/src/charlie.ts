import {
  Order,
  CurrencyCode,
  AnalyticsSnapshot,
  SalesSummary,
  ParetoResult,
  CustomerAnalytics,
  ProductAnalytics,
  TrendAnalytics,
  ParetoDimension,
} from "@charlie-the-ai/advisor-types";
import {
  createAnalyticsSnapshot,
  calculateSalesSummary,
  calculatePareto,
  calculateCustomerAnalytics,
  calculateProductAnalytics,
  calculateTrends,
  extractParetoInputsFromOrders,
  Money,
} from "@charlie-the-ai/analytics-core";
import {
  createOrderAdapter,
  createLaravelOrderAdapter,
  OrderAdapterConfig,
} from "@charlie-the-ai/analytics-adapters";

export interface CharlieConfig {
  apiKey?: string;
  apiUrl?: string;
  businessId?: string;
  defaultCurrency?: CurrencyCode;
}

export interface AnalyzeOptions {
  orders: Order[];
  currency?: CurrencyCode;
  businessId?: string;
  period?: {
    from?: string;
    to?: string;
    timezone?: string;
  };
  previousPeriodOrders?: Order[];
  paretoThreshold?: number;
}

/**
 * Charlie the Business Advisor — Main Public Client.
 * Enables zero-dependency local analytics and optional SaaS integration.
 */
export class Charlie {
  private readonly config: CharlieConfig;

  constructor(config: CharlieConfig = {}) {
    this.config = {
      defaultCurrency: "NGN",
      apiUrl: "https://api.charlieadvisor.com",
      ...config,
    };
  }

  /**
   * Generates a complete, deterministic AnalyticsSnapshot across all dimensions.
   */
  public analyze(options: AnalyzeOptions): AnalyticsSnapshot {
    const currency = options.currency ?? this.config.defaultCurrency ?? "NGN";
    const businessId = options.businessId ?? this.config.businessId ?? "default_business";

    // Infer period if not provided
    let from = options.period?.from;
    let to = options.period?.to;

    if (!from || !to) {
      if (options.orders.length > 0) {
        const sortedTimes = options.orders
          .map((o) => new Date(o.createdAt).getTime())
          .filter((t) => !isNaN(t))
          .sort((a, b) => a - b);

        from = from ?? new Date(sortedTimes[0]!).toISOString();
        to = to ?? new Date(sortedTimes[sortedTimes.length - 1]!).toISOString();
      } else {
        const now = new Date().toISOString();
        from = from ?? now;
        to = to ?? now;
      }
    }

    return createAnalyticsSnapshot({
      businessId,
      currency,
      period: {
        from,
        to,
        timezone: options.period?.timezone ?? "UTC",
      },
      orders: options.orders,
      previousPeriodOrders: options.previousPeriodOrders,
      paretoThreshold: options.paretoThreshold ?? 80,
    });
  }

  /**
   * Analyzes sales performance exclusively.
   */
  public sales(orders: Order[], currency?: CurrencyCode): SalesSummary {
    return calculateSalesSummary({
      orders,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Calculates Pareto concentration on products, customers, or categories.
   */
  public pareto(
    orders: Order[],
    dimension: ParetoDimension,
    currency?: CurrencyCode,
    thresholdPercentage: number = 80
  ): ParetoResult {
    const cur = currency ?? this.config.defaultCurrency ?? "NGN";
    const inputs = extractParetoInputsFromOrders(orders, dimension);
    return calculatePareto({
      dimension,
      items: inputs,
      currency: cur,
      thresholdPercentage,
    });
  }

  /**
   * Analyzes customer retention, RFM segmentation, and cohorts.
   */
  public customers(orders: Order[], currency?: CurrencyCode): CustomerAnalytics {
    return calculateCustomerAnalytics({
      orders,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Analyzes product velocity, revenue contribution, and profit margins.
   */
  public products(orders: Order[], currency?: CurrencyCode): ProductAnalytics {
    return calculateProductAnalytics({
      orders,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Analyzes revenue trends, moving averages, and statistical anomalies.
   */
  public trends(orders: Order[], currency?: CurrencyCode): TrendAnalytics {
    const cur = currency ?? this.config.defaultCurrency ?? "NGN";
    const sales = calculateSalesSummary({ orders, currency: cur });
    return calculateTrends({
      periodicSales: sales.periodicBreakdown,
      currency: cur,
    });
  }

  /**
   * Creates a custom data adapter.
   */
  public createAdapter<TSource, TItemSource>(
    config: OrderAdapterConfig<TSource, TItemSource>
  ) {
    return createOrderAdapter(config);
  }

  /**
   * Creates a pre-configured Laravel Eloquent adapter.
   */
  public laravelAdapter(defaultCurrency?: CurrencyCode) {
    return createLaravelOrderAdapter(defaultCurrency ?? this.config.defaultCurrency ?? "NGN");
  }

  /**
   * Money helper for formatting and safe arithmetic.
   */
  public get money() {
    return Money;
  }
}
