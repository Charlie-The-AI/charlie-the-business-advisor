import { CharlieService } from "./charlie.service.js";

/**
 * NestJS Controller demonstrating REST endpoints for Charlie.
 */
export class CharlieController {
  constructor(private readonly charlieService: CharlieService) {}

  /**
   * POST /analytics/analyze
   */
  public async handleAnalyze(body: any) {
    const { orders = [], customers = [], currency = "NGN", businessId = "nest_business" } = body;
    const snapshot = this.charlieService.analyze({
      orders,
      customers,
      currency,
      businessId,
    });
    return { success: true, snapshot };
  }

  /**
   * POST /analytics/advise
   */
  public async handleAdvise(body: any) {
    const { orders, customers, analytics, objective } = body;
    const result = await this.charlieService.advise({
      orders,
      customers,
      analytics,
      objective,
    });
    return { success: true, ...result };
  }

  /**
   * POST /analytics/chat
   */
  public async handleChat(body: any) {
    const { question, orders, analytics, history } = body;
    if (!question) {
      throw new Error("Missing 'question' in request body.");
    }
    const result = await this.charlieService.chat({
      question,
      orders,
      analytics,
      history,
    });
    return { success: true, ...result };
  }
}
