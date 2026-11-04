/**
 * Datasets in Charlie the Business Advisor.
 *
 * Production-Ready Datasets (Available Now):
 * - CharlieOrder: Canonical order transactions, line items, monetary values, and refund tracking.
 * - CharlieCustomer: Customer identification, profile, regional metadata, and purchasing behavior.
 *
 * Roadmap Datasets (Coming Soon):
 * - CharlieProduct: Inventory velocity, product profitability, categorization, and stock turnover analysis.
 * - CharliePayment: Payment gateway success rates, processor settlements, dispute rates, and gateway fees.
 * - CharlieBooking: Hospitality, rental, and service appointment occupancy, lead times, and scheduling utilization.
 * - CharlieExpense: Operating expenses (OPEX), COGS, overhead allocation, and net business profitability.
 * - CharlieSubscription: Recurring revenue metrics: MRR, ARR, churn rate, expansion, contraction, and cohort retention.
 */

export const AVAILABLE_DATASETS = [
  {
    name: "CharlieOrder",
    description: "Order transactions, line items, monetary values, and refund tracking.",
    status: "available" as const,
  },
  {
    name: "CharlieCustomer",
    description: "Customer identification, profile, regional metadata, and purchasing behavior.",
    status: "available" as const,
  },
] as const;

export const COMING_SOON_DATASETS = [
  {
    name: "CharlieProduct",
    description: "Inventory velocity, product-level profit margins, categorizations, and stock turnover analysis.",
    status: "coming_soon" as const,
  },
  {
    name: "CharliePayment",
    description: "Payment gateway success rates, processor settlements, dispute rates, and gateway fee reconciliation.",
    status: "coming_soon" as const,
  },
  {
    name: "CharlieBooking",
    description: "Hospitality, rental, and service appointment occupancy, lead times, and scheduling utilization.",
    status: "coming_soon" as const,
  },
  {
    name: "CharlieExpense",
    description: "Operating expenses (OPEX), COGS, overhead allocation, and net business profitability.",
    status: "coming_soon" as const,
  },
  {
    name: "CharlieSubscription",
    description: "SaaS & recurring revenue metrics: MRR, ARR, churn rate, expansion, contraction, and cohort retention.",
    status: "coming_soon" as const,
  },
] as const;

export type AvailableDatasetName = (typeof AVAILABLE_DATASETS)[number]["name"];
export type ComingSoonDatasetName = (typeof COMING_SOON_DATASETS)[number]["name"];
