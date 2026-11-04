import {
  Charlie,
  CharlieOrder,
  CharlieCustomer,
  AnalyticsSnapshot,
  AdviseResult,
  ChatResult,
  CurrencyCode,
} from "charlie-the-business-advisor";

declare const process: any;

/**
 * NestJS Injectable Service for Charlie the Business Advisor.
 * Demonstrates clean architecture dependency injection in NestJS applications.
 */
export class CharlieService {
  private readonly charlie: Charlie;

  constructor() {
    this.charlie = new Charlie({
      defaultCurrency: (process.env.CHARLIE_DEFAULT_CURRENCY as CurrencyCode) || "NGN",
    });
  }

  /**
   * Deterministic analytics execution.
   */
  public analyze(params: {
    orders: CharlieOrder[];
    customers?: CharlieCustomer[];
    currency?: CurrencyCode;
    businessId?: string;
  }): AnalyticsSnapshot {
    return this.charlie.analyze(params);
  }

  /**
   * AI-powered grounded business advice.
   */
  public async advise(params: {
    orders?: CharlieOrder[];
    customers?: CharlieCustomer[];
    analytics?: AnalyticsSnapshot;
    objective?: string;
  }): Promise<AdviseResult> {
    return this.charlie.advise(params);
  }

  /**
   * Natural language business inquiry.
   */
  public async chat(params: {
    question: string;
    orders?: CharlieOrder[];
    analytics?: AnalyticsSnapshot;
    history?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  }): Promise<ChatResult> {
    return this.charlie.chat(params);
  }
}
