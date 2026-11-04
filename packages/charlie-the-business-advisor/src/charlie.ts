import {
  Order,
  CharlieOrder,
  Customer,
  CharlieCustomer,
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
  createCustomerAdapter,
  createLaravelOrderAdapter,
  OrderAdapterConfig,
  CustomerAdapterConfig,
  DeclarativeOrderMapping,
  DeclarativeCustomerMapping,
} from "@charlie-the-ai/analytics-adapters";
import {
  CharlieAdvisor,
  createAdvisor,
  CharlieAiProvider,
  ProviderConfig,
  RecommendationCategory,
  RecommendationItem,
  ChatMessage,
  ChatResult,
} from "@charlie-the-ai/advisor-ai";

export interface CharlieConfig {
  ai?: ProviderConfig | CharlieAiProvider;
  defaultCurrency?: CurrencyCode;
  businessId?: string;
  // Legacy / backward-compatibility options
  apiKey?: string;
  apiUrl?: string;
}

export interface AnalyzeOptions {
  orders: (Order | CharlieOrder)[];
  customers?: (Customer | CharlieCustomer)[];
  currency?: CurrencyCode;
  businessId?: string;
  period?: {
    from?: string;
    to?: string;
    timezone?: string;
  };
  previousPeriodOrders?: (Order | CharlieOrder)[];
  paretoThreshold?: number;
}

export interface AdviseOptions {
  analytics?: AnalyticsSnapshot;
  orders?: (Order | CharlieOrder)[];
  customers?: (Customer | CharlieCustomer)[];
  currency?: CurrencyCode;
  businessId?: string;
  period?: {
    from?: string;
    to?: string;
    timezone?: string;
  };
  previousPeriodOrders?: (Order | CharlieOrder)[];
  paretoThreshold?: number;
  objective?: string;
  category?: RecommendationCategory;
  includeCustomerDetails?: boolean;
}

export interface AdviseResult {
  snapshot: AnalyticsSnapshot;
  summary: string;
  recommendations: RecommendationItem[];
  limitations: string[];
  metadata?: {
    provider: string;
    model?: string;
    tokensUsed?: number;
  };
}

export interface ChatOptions {
  question: string;
  analytics?: AnalyticsSnapshot;
  orders?: (Order | CharlieOrder)[];
  customers?: (Customer | CharlieCustomer)[];
  currency?: CurrencyCode;
  businessId?: string;
  period?: {
    from?: string;
    to?: string;
    timezone?: string;
  };
  history?: ChatMessage[];
  includeCustomerDetails?: boolean;
}

/**
 * Charlie the Business Advisor — Main Public Client.
 *
 * Provides a unified, developer-friendly interface for deterministic business
 * analytics, multi-provider AI business advisory, and conversational insight.
 */
export class Charlie {
  private readonly config: CharlieConfig;
  private readonly advisor: CharlieAdvisor;

  constructor(config: CharlieConfig = {}) {
    this.config = {
      defaultCurrency: "NGN",
      businessId: "default_business",
      ...config,
    };

    // Initialize AI advisor (resolves from env or falls back to offline Mock)
    this.advisor = createAdvisor(config.ai);
  }

  /**
   * Generates a complete, deterministic AnalyticsSnapshot across all dimensions.
   * 100% offline, zero AI, deterministic financial calculations.
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
          .map((o) => {
            const raw = "placedAt" in o ? o.placedAt : o.createdAt;
            return new Date(raw).getTime();
          })
          .filter((t) => !isNaN(t))
          .sort((a, b) => a - b);

        if (sortedTimes.length > 0) {
          from = from ?? new Date(sortedTimes[0]!).toISOString();
          to = to ?? new Date(sortedTimes[sortedTimes.length - 1]!).toISOString();
        }
      }

      if (!from || !to) {
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
      customers: options.customers,
      previousPeriodOrders: options.previousPeriodOrders,
      paretoThreshold: options.paretoThreshold ?? 80,
    });
  }

  /**
   * Generates grounded, actionable AI business recommendations.
   * Runs deterministic analytics first, then verifies every quantitative claim.
   */
  public async advise(options: AdviseOptions): Promise<AdviseResult> {
    let snapshot: AnalyticsSnapshot;

    if (options.analytics) {
      snapshot = options.analytics;
    } else if (options.orders) {
      snapshot = this.analyze({
        orders: options.orders,
        customers: options.customers,
        currency: options.currency,
        businessId: options.businessId,
        period: options.period,
        previousPeriodOrders: options.previousPeriodOrders,
        paretoThreshold: options.paretoThreshold,
      });
    } else {
      throw new Error(
        "Charlie.advise() requires either an existing 'analytics' snapshot or 'orders' to analyze."
      );
    }

    const aiResult = await this.advisor.advise({
      analytics: snapshot,
      objective: options.objective,
      category: options.category,
      includeCustomerDetails: options.includeCustomerDetails,
    });

    return {
      snapshot,
      summary: aiResult.summary,
      recommendations: aiResult.recommendations,
      limitations: aiResult.limitations,
      metadata: aiResult.metadata,
    };
  }

  /**
   * Answers a business question grounded in deterministic analytics.
   */
  public async chat(options: ChatOptions): Promise<ChatResult> {
    let snapshot: AnalyticsSnapshot;

    if (options.analytics) {
      snapshot = options.analytics;
    } else if (options.orders) {
      snapshot = this.analyze({
        orders: options.orders,
        customers: options.customers,
        currency: options.currency,
        businessId: options.businessId,
        period: options.period,
      });
    } else {
      throw new Error(
        "Charlie.chat() requires either an existing 'analytics' snapshot or 'orders' to calculate."
      );
    }

    return this.advisor.chat({
      question: options.question,
      analytics: snapshot,
      history: options.history,
      includeCustomerDetails: options.includeCustomerDetails,
    });
  }

  /**
   * Analyzes sales performance deterministically.
   */
  public sales(orders: (Order | CharlieOrder)[], currency?: CurrencyCode): SalesSummary {
    return calculateSalesSummary({
      orders,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Calculates Pareto concentration on products, customers, or categories.
   */
  public pareto(
    orders: (Order | CharlieOrder)[],
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
  public customers(
    orders: (Order | CharlieOrder)[],
    customers?: (Customer | CharlieCustomer)[],
    currency?: CurrencyCode
  ): CustomerAnalytics {
    return calculateCustomerAnalytics({
      orders,
      customers,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Analyzes product velocity, revenue contribution, and profit margins.
   */
  public products(orders: (Order | CharlieOrder)[], currency?: CurrencyCode): ProductAnalytics {
    return calculateProductAnalytics({
      orders,
      currency: currency ?? this.config.defaultCurrency ?? "NGN",
    });
  }

  /**
   * Analyzes revenue trends, moving averages, and statistical anomalies.
   */
  public trends(orders: (Order | CharlieOrder)[], currency?: CurrencyCode): TrendAnalytics {
    const cur = currency ?? this.config.defaultCurrency ?? "NGN";
    const sales = calculateSalesSummary({ orders, currency: cur });
    return calculateTrends({
      periodicSales: sales.periodicBreakdown,
      currency: cur,
    });
  }

  /**
   * Creates an order adapter with declarative mapping or transform function.
   */
  public createOrderAdapter<TSource, TItemSource = any>(
    config: OrderAdapterConfig<TSource, TItemSource> | DeclarativeOrderMapping<TSource, TItemSource>
  ) {
    return createOrderAdapter(config);
  }

  /**
   * Creates a customer adapter with declarative mapping or transform function.
   */
  public createCustomerAdapter<TSource>(
    config: CustomerAdapterConfig<TSource> | DeclarativeCustomerMapping<TSource>
  ) {
    return createCustomerAdapter(config);
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

  /**
   * Static adapter factory shortcut.
   */
  public static createOrderAdapter = createOrderAdapter;
  public static createCustomerAdapter = createCustomerAdapter;
}

/**
 * Creates and initializes a Charlie instance.
 */
export function createCharlie(config?: CharlieConfig): Charlie {
  return new Charlie(config);
}
