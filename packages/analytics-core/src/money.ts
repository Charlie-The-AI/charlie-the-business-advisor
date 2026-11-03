import { getCurrencyMetadata, CurrencyCode } from "@charlie/advisor-types";

/**
 * Deterministic fixed-point financial arithmetic and formatting.
 * Avoids IEEE-754 floating-point inaccuracies by computing on integer minor units (e.g. kobo, cents).
 */
export class Money {
  /**
   * Adds two or more integer minor unit values deterministically.
   */
  public static add(...amounts: number[]): number {
    return amounts.reduce((acc, curr) => {
      const sum = Math.round(acc) + Math.round(curr);
      if (!Number.isSafeInteger(sum)) {
        throw new RangeError("Money addition exceeded safe integer range");
      }
      return sum;
    }, 0);
  }

  /**
   * Subtracts integer minor unit values deterministically.
   */
  public static subtract(minuend: number, ...subtrahends: number[]): number {
    return subtrahends.reduce((acc, curr) => {
      const diff = Math.round(acc) - Math.round(curr);
      if (!Number.isSafeInteger(diff)) {
        throw new RangeError("Money subtraction exceeded safe integer range");
      }
      return diff;
    }, Math.round(minuend));
  }

  /**
   * Multiplies an integer minor unit value by a multiplier (e.g. quantity or factor).
   * Applies half-up rounding to preserve integer minor units.
   */
  public static multiply(minorUnits: number, factor: number): number {
    const result = Math.round(Math.round(minorUnits) * factor);
    if (!Number.isSafeInteger(result)) {
      throw new RangeError("Money multiplication exceeded safe integer range");
    }
    return result;
  }

  /**
   * Divides an integer minor unit value by a divisor with half-up rounding.
   * Returns 0 if divisor is 0.
   */
  public static divide(minorUnits: number, divisor: number): number {
    if (divisor === 0) {
      return 0;
    }
    return Math.round(Math.round(minorUnits) / divisor);
  }

  /**
   * Calculates percentage ratio (e.g. numerator / denominator * 100) rounded to specified decimal places.
   * Returns null if denominator is 0.
   */
  public static percentage(numerator: number, denominator: number, decimals: number = 2): number | null {
    if (denominator === 0) {
      return null;
    }
    const factor = Math.pow(10, decimals);
    return Math.round((numerator / denominator) * 100 * factor) / factor;
  }

  /**
   * Formats integer minor units into human-readable currency representation.
   * e.g., formatMinorUnits(2500000, "NGN") => "₦25,000.00"
   * e.g., formatMinorUnits(1500, "USD") => "$15.00"
   * e.g., formatMinorUnits(1500, "JPY") => "¥1,500"
   */
  public static format(minorUnits: number, currency: CurrencyCode): string {
    const meta = getCurrencyMetadata(currency);
    const isNegative = minorUnits < 0;
    const absUnits = Math.abs(Math.round(minorUnits));

    let integerPartString: string;
    let fractionPartString = "";

    if (meta.minorUnitDecimals === 0) {
      integerPartString = absUnits.toString();
    } else {
      const factor = Math.pow(10, meta.minorUnitDecimals);
      const integerPart = Math.floor(absUnits / factor);
      const fractionPart = absUnits % factor;

      integerPartString = integerPart.toString();
      fractionPartString = fractionPart.toString().padStart(meta.minorUnitDecimals, "0");
    }

    // Add thousands separators
    const formattedInteger = integerPartString.replace(/\B(?=(\d{3})+(?!\d))/g, meta.thousandsSeparator);

    const baseAmount =
      meta.minorUnitDecimals > 0
        ? `${formattedInteger}${meta.decimalSeparator}${fractionPartString}`
        : formattedInteger;

    const formattedWithSign = isNegative ? `-${baseAmount}` : baseAmount;

    return meta.symbolPosition === "prefix"
      ? `${meta.symbol}${formattedWithSign}`
      : `${formattedWithSign} ${meta.symbol}`;
  }

  /**
   * Converts standard major decimal units (e.g. 250.50 NGN) to integer minor units (25050).
   */
  public static toMinorUnits(majorUnits: number, currency: CurrencyCode): number {
    const meta = getCurrencyMetadata(currency);
    const factor = Math.pow(10, meta.minorUnitDecimals);
    return Math.round(majorUnits * factor);
  }

  /**
   * Converts integer minor units to major decimal units.
   */
  public static toMajorUnits(minorUnits: number, currency: CurrencyCode): number {
    const meta = getCurrencyMetadata(currency);
    const factor = Math.pow(10, meta.minorUnitDecimals);
    return minorUnits / factor;
  }
}
