import {
  CharlieAiProvider,
  RecommendationInput,
  RecommendationResult,
  ChatInput,
  ChatResult,
  RecommendationItem,
} from "../types.js";
import { verifyRecommendationGrounding, verifyChatGrounding } from "../grounding.js";

/**
 * MockAiProvider generates deterministic, grounded recommendations and chat answers
 * directly from snapshot calculations without making network requests.
 * Ideal for CI, testing, and zero-key local development.
 */
export class MockAiProvider implements CharlieAiProvider {
  public readonly id = "mock";

  public async generateRecommendations(
    input: RecommendationInput
  ): Promise<RecommendationResult> {
    const s = input.analytics;
    const recommendations: RecommendationItem[] = [];

    // 1. Pareto Concentration
    if (s.pareto.products.giniCoefficient > 0.5) {
      const topProd = s.pareto.products.contributors[0];
      recommendations.push({
        id: "REC-001",
        title: "Mitigate Revenue Concentration Risk",
        priority: "high",
        category: "revenue_concentration",
        description: `Revenue is highly concentrated: ${s.pareto.products.vitalContributorsCount} of ${s.pareto.products.totalContributors} products generate the majority of sales. Top performer "${topProd?.name ?? 'Top Product'}" drives ${topProd?.contributionPercentage ?? 0}% of revenue.`,
        evidence: [
          {
            metric: "giniCoefficient",
            value: s.pareto.products.giniCoefficient,
          },
          {
            metric: "vitalContributorsCount",
            value: s.pareto.products.vitalContributorsCount,
          },
        ],
        suggestedActions: [
          `Promote secondary catalog items alongside "${topProd?.name ?? 'Top Product'}"`,
          "Introduce product bundles to increase cross-selling",
          "Monitor inventory levels closely on vital revenue drivers",
        ],
      });
    }

    // 2. Customer Retention
    if (s.customers.repeatPurchaseRatePercentage !== null) {
      const rate = s.customers.repeatPurchaseRatePercentage;
      if (rate < 40) {
        recommendations.push({
          id: "REC-002",
          title: "Implement Repeat Buyer Nurture Campaign",
          priority: "medium",
          category: "customer_retention",
          description: `Current repeat purchase rate is ${rate}%. Increasing repeat orders significantly improves lifetime value without additional acquisition cost.`,
          evidence: [
            {
              metric: "repeatPurchaseRatePercentage",
              value: rate,
            },
            {
              metric: "totalCustomers",
              value: s.customers.uniqueCustomersCount,
            },
          ],
          suggestedActions: [
            "Send an automated follow-up email 14 days post-purchase",
            "Offer a time-sensitive incentive for second purchases",
            "Survey first-time buyers on satisfaction",
          ],
        });
      }
    }

    // 3. Average Order Value
    recommendations.push({
      id: "REC-003",
      title: "Optimize Average Order Value (AOV)",
      priority: "low",
      category: "pricing_opportunities",
      description: `Your average order value stands at ${s.sales.averageOrderValueFormatted} across ${s.sales.totalCompletedOrders} completed orders.`,
      evidence: [
        {
          metric: "averageOrderValue",
          value: s.sales.averageOrderValueFormatted,
        },
        {
          metric: "totalOrders",
          value: s.sales.totalOrders,
        },
      ],
      suggestedActions: [
        "Set free shipping thresholds slightly above your average order value",
        "Offer complementary add-ons at checkout",
      ],
    });

    const limitations: string[] = [...s.dataQuality.warnings];
    if (s.customers.isInsufficientData) {
      limitations.push("Customer retention insights limited by missing customer identifiers.");
    }

    const verification = verifyRecommendationGrounding(recommendations, s);

    return {
      summary: `Business performance shows ${s.sales.netRevenueFormatted} net revenue across ${s.sales.totalCompletedOrders} completed orders. Growth focus should target retention and catalog diversification.`,
      recommendations: verification.verifiedRecommendations,
      limitations,
      metadata: {
        provider: "mock",
        model: "deterministic-rule-engine",
      },
    };
  }

  public async chat(input: ChatInput): Promise<ChatResult> {
    const s = input.analytics;
    const q = input.question.toLowerCase();

    let answer = "";
    const evidence: ChatResult["evidence"] = [];

    if (q.includes("revenue") || q.includes("sales") || q.includes("make") || q.includes("earn")) {
      answer = `Your business generated ${s.sales.netRevenueFormatted} in net revenue across ${s.sales.totalCompletedOrders} completed orders during this period (Gross sales: ${s.sales.grossSalesFormatted}).`;
      evidence.push(
        { metric: "netRevenue", value: s.sales.netRevenueFormatted },
        { metric: "totalOrders", value: s.sales.totalOrders }
      );
    } else if (q.includes("product") || q.includes("best") || q.includes("selling")) {
      const top = s.products.bestSellersByRevenue[0];
      if (top) {
        answer = `Your best-selling product by revenue is "${top.productName}", generating ${top.revenueFormatted} across ${top.unitsSold} units sold (${top.revenuePercentage}% of total product sales).`;
        evidence.push({
          metric: "bestSellerRevenue",
          reference: top.productName,
          value: top.revenueFormatted,
        });
      } else {
        answer = "No product sales records were found in this dataset.";
      }
    } else if (q.includes("customer") || q.includes("repeat") || q.includes("retention")) {
      const rate = s.customers.repeatPurchaseRatePercentage;
      answer = `You have ${s.customers.uniqueCustomersCount} total customers tracked. ${s.customers.repeatCustomersCount} are repeat buyers, giving a repeat purchase rate of ${rate !== null ? `${rate}%` : "undetermined"}.`;
      if (rate !== null) {
        evidence.push({ metric: "repeatPurchaseRatePercentage", value: `${rate}%` });
      }
    } else {
      answer = `Based on your analytics, your business recorded ${s.sales.netRevenueFormatted} net revenue with an average order value of ${s.sales.averageOrderValueFormatted}. Let me know if you would like details on products, customers, or sales trends.`;
      evidence.push({ metric: "netRevenue", value: s.sales.netRevenueFormatted });
    }

    const verified = verifyChatGrounding(
      {
        answer,
        evidence,
        limitations: [...s.dataQuality.warnings],
        metadata: { provider: "mock", model: "deterministic-chat" },
      },
      s
    );

    return verified;
  }
}
