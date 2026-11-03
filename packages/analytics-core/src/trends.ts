import {
  PeriodicSalesPoint,
  TrendAnalytics,
  MovingAveragePoint,
  AnomalyPoint,
  CurrencyCode,
} from "@charlie/advisor-types";
import { Money } from "./money.js";

export interface CalculateTrendsOptions {
  periodicSales: PeriodicSalesPoint[];
  currency: CurrencyCode;
  previousPeriodSales?: PeriodicSalesPoint[];
  anomalyZScoreThreshold?: number; // Default 2.0
}

/**
 * Calculates trend analytics including moving averages, volatility, and statistical anomalies.
 */
export function calculateTrends(options: CalculateTrendsOptions): TrendAnalytics {
  const {
    periodicSales,
    currency,
    previousPeriodSales,
    anomalyZScoreThreshold = 2.0,
  } = options;

  // Sort chronologically
  const sorted = [...periodicSales].sort((a, b) => a.period.localeCompare(b.period));

  // Compute 7-day moving averages
  const sevenDayMovingAverage = computeMovingAverage(sorted, 7);

  // Compute 30-day moving averages
  const thirtyDayMovingAverage = computeMovingAverage(sorted, 30);

  // Compute standard deviation and mean for volatility and anomalies
  const revenueValues = sorted.map((p) => p.netRevenueMinorUnits);
  const n = revenueValues.length;

  let mean = 0;
  let standardDeviation = 0;
  let revenueVolatilityCoefficient = 0;

  if (n > 0) {
    const sum = revenueValues.reduce((acc, curr) => acc + curr, 0);
    mean = sum / n;

    if (n > 1) {
      const varianceSum = revenueValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
      standardDeviation = Math.sqrt(varianceSum / (n - 1));
      revenueVolatilityCoefficient = mean > 0 ? Math.round((standardDeviation / mean) * 1000) / 1000 : 0;
    }
  }

  // Detect statistical anomalies (z-score >= threshold)
  const anomalies: AnomalyPoint[] = [];

  if (n >= 5 && standardDeviation > 0) {
    for (const point of sorted) {
      const zScore = (point.netRevenueMinorUnits - mean) / standardDeviation;
      if (Math.abs(zScore) >= anomalyZScoreThreshold) {
        const isSpike = zScore > 0;
        const formattedActual = Money.format(point.netRevenueMinorUnits, currency);
        const formattedExpected = Money.format(Math.round(mean), currency);
        const roundedZ = Math.round(zScore * 10) / 10;

        anomalies.push({
          date: point.period,
          actualRevenueMinorUnits: point.netRevenueMinorUnits,
          expectedRevenueMinorUnits: Math.round(mean),
          zScore: roundedZ,
          type: isSpike ? "spike" : "drop",
          isSignificant: true,
          description: isSpike
            ? `Revenue spiked to ${formattedActual} on ${point.period} (${roundedZ} std dev above baseline of ${formattedExpected}).`
            : `Revenue dropped to ${formattedActual} on ${point.period} (${Math.abs(roundedZ)} std dev below baseline of ${formattedExpected}).`,
        });
      }
    }
  }

  // Compute period comparison
  const currentPeriodRevenue = sorted.reduce((acc, curr) => Money.add(acc, curr.netRevenueMinorUnits), 0);
  let previousPeriodRevenue = 0;

  if (previousPeriodSales && previousPeriodSales.length > 0) {
    previousPeriodRevenue = previousPeriodSales.reduce(
      (acc, curr) => Money.add(acc, curr.netRevenueMinorUnits),
      0
    );
  }

  const absoluteDifference = Money.subtract(currentPeriodRevenue, previousPeriodRevenue);
  let percentageChange: number | null = null;
  if (previousPeriodRevenue > 0) {
    percentageChange = Math.round((absoluteDifference / previousPeriodRevenue) * 10000) / 100;
  }

  return {
    sevenDayMovingAverage,
    thirtyDayMovingAverage,
    revenueVolatilityCoefficient,
    periodComparison: {
      currentPeriodRevenueMinorUnits: currentPeriodRevenue,
      previousPeriodRevenueMinorUnits: previousPeriodRevenue,
      absoluteDifferenceMinorUnits: absoluteDifference,
      percentageChange,
    },
    anomalies,
  };
}

function computeMovingAverage(
  sortedPoints: PeriodicSalesPoint[],
  windowSize: number
): MovingAveragePoint[] {
  const result: MovingAveragePoint[] = [];

  for (let i = 0; i < sortedPoints.length; i++) {
    const windowStart = Math.max(0, i - windowSize + 1);
    const windowSlice = sortedPoints.slice(windowStart, i + 1);
    const windowSum = windowSlice.reduce((sum, p) => sum + p.netRevenueMinorUnits, 0);
    const avg = Math.round(windowSum / windowSlice.length);

    result.push({
      date: sortedPoints[i]!.period,
      revenueMinorUnits: sortedPoints[i]!.netRevenueMinorUnits,
      movingAverageMinorUnits: avg,
    });
  }

  return result;
}
