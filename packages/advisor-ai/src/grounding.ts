import type { AnalyticsSnapshot } from "@charlie-the-ai/advisor-types";
import { RecommendationItem, ChatResult, EvidenceItem } from "./types.js";

export interface GroundingVerificationResult {
  verifiedRecommendations: RecommendationItem[];
  unsupportedClaimsCount: number;
  groundingWarnings: string[];
}

/**
 * Verifies that quantitative claims and evidence references in AI recommendations
 * accurately reflect deterministic calculations in the AnalyticsSnapshot.
 */
export function verifyRecommendationGrounding(
  recommendations: RecommendationItem[],
  snapshot: AnalyticsSnapshot
): GroundingVerificationResult {
  const verifiedRecommendations: RecommendationItem[] = [];
  const groundingWarnings: string[] = [];
  let unsupportedClaimsCount = 0;

  for (const rec of recommendations) {
    const verifiedEvidence: EvidenceItem[] = [];
    let recHasUnsupportedClaim = false;

    for (const ev of rec.evidence) {
      const check = verifySingleEvidenceMetric(ev, snapshot);
      if (check.isMatch) {
        verifiedEvidence.push({
          ...ev,
          isVerified: true,
        });
      } else {
        recHasUnsupportedClaim = true;
        unsupportedClaimsCount++;
        groundingWarnings.push(
          `Recommendation "${rec.title}" claimed ${ev.metric}=${ev.value}, but analytical calculation indicates ${check.actualValue}.`
        );
        verifiedEvidence.push({
          ...ev,
          isVerified: false,
        });
      }
    }

    verifiedRecommendations.push({
      ...rec,
      evidence: verifiedEvidence,
      groundingStatus: recHasUnsupportedClaim ? "flagged" : "verified",
    });
  }

  return {
    verifiedRecommendations,
    unsupportedClaimsCount,
    groundingWarnings,
  };
}

/**
 * Verifies single evidence item against known snapshot metrics.
 */
export function verifySingleEvidenceMetric(
  evidence: EvidenceItem,
  snapshot: AnalyticsSnapshot
): { isMatch: boolean; actualValue: string | number } {
  const metric = evidence.metric.toLowerCase().trim();
  const rawValue = evidence.value;

  // 1. Gross Sales
  if (metric.includes("gross") || metric === "sales" || metric === "grosssales") {
    const actual = snapshot.sales.grossSalesFormatted;
    const isMatch =
      String(rawValue).includes(actual) ||
      Math.abs(Number(rawValue) - snapshot.sales.grossSalesMinorUnits) < 100 ||
      Math.abs(Number(rawValue) - snapshot.sales.grossSalesMinorUnits / 100) < 5;
    return { isMatch, actualValue: actual };
  }

  // 2. Net Revenue
  if (metric.includes("netrevenue") || metric.includes("revenue")) {
    const actual = snapshot.sales.netRevenueFormatted;
    const isMatch =
      String(rawValue).includes(actual) ||
      Math.abs(Number(rawValue) - snapshot.sales.netRevenueMinorUnits) < 100 ||
      Math.abs(Number(rawValue) - snapshot.sales.netRevenueMinorUnits / 100) < 5;
    return { isMatch, actualValue: actual };
  }

  // 3. Total Customers
  if (metric.includes("totalcustomers") || metric.includes("uniquecustomers")) {
    const actual = snapshot.customers.uniqueCustomersCount;
    const isMatch = Number(rawValue) === actual;
    return { isMatch, actualValue: actual };
  }

  // 4. Total Orders
  if (metric.includes("orders") || metric.includes("totalorders")) {
    const actual = snapshot.sales.totalOrders;
    const isMatch = Number(rawValue) === actual;
    return { isMatch, actualValue: actual };
  }

  // 3. Average Order Value
  if (metric.includes("aov") || metric.includes("averageorder")) {
    const actual = snapshot.sales.averageOrderValueFormatted;
    const isMatch =
      String(rawValue).includes(actual) ||
      Math.abs(Number(rawValue) - snapshot.sales.averageOrderValueMinorUnits) < 100;
    return { isMatch, actualValue: actual };
  }

  // 4. Repeat Purchase Rate
  if (metric.includes("repeat") || metric.includes("retention")) {
    const actual = snapshot.customers.repeatPurchaseRatePercentage;
    if (actual === null) return { isMatch: false, actualValue: "Insufficient Data" };
    const num = Number(String(rawValue).replace(/[^0-9.]/g, ""));
    const isMatch = Math.abs(num - actual) <= 1.0; // Within 1% tolerance
    return { isMatch, actualValue: `${actual}%` };
  }

  // 5. Pareto Gini / Concentration
  if (metric.includes("gini") || metric.includes("concentration")) {
    const actual = snapshot.pareto.products.giniCoefficient;
    const num = Number(rawValue);
    const isMatch = Math.abs(num - actual) <= 0.05;
    return { isMatch, actualValue: actual };
  }

  // 6. Vital Few count
  if (metric.includes("vitalfew") || metric.includes("vitalcontributors")) {
    const actual = snapshot.pareto.products.vitalContributorsCount;
    const isMatch = Number(rawValue) === actual;
    return { isMatch, actualValue: actual };
  }

  // Default: if metric isn't a known financial metric, accept with caution
  return { isMatch: true, actualValue: String(rawValue) };
}

/**
 * Verifies conversational chat answer evidence.
 */
export function verifyChatGrounding(
  chatResult: ChatResult,
  snapshot: AnalyticsSnapshot
): ChatResult {
  const verifiedEvidence: EvidenceItem[] = [];
  const limitations = Array.isArray(chatResult.limitations) ? [...chatResult.limitations] : [];

  for (const ev of (chatResult.evidence || [])) {
    const check = verifySingleEvidenceMetric(ev, snapshot);
    if (check.isMatch) {
      verifiedEvidence.push({ ...ev, isVerified: true });
    } else {
      verifiedEvidence.push({ ...ev, isVerified: false });
      limitations.push(
        `Quantitative claim on ${ev.metric}=${ev.value} could not be mathematically verified against current analytics.`
      );
    }
  }

  return {
    ...chatResult,
    evidence: verifiedEvidence,
    limitations,
  };
}
