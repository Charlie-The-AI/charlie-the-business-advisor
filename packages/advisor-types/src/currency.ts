import { z } from "zod";

/**
 * Standard ISO 4217 Currency Codes supported by Charlie
 */
export const SupportedCurrencyCodes = [
  "NGN", // Nigerian Naira
  "USD", // US Dollar
  "EUR", // Euro
  "GBP", // British Pound Sterling
  "KES", // Kenyan Shilling
  "GHS", // Ghanaian Cedi
  "ZAR", // South African Rand
  "CAD", // Canadian Dollar
  "AUD", // Australian Dollar
  "JPY", // Japanese Yen
  "BHD", // Bahraini Dinar
  "KWD", // Kuwaiti Dinar
] as const;

export type CurrencyCode = (typeof SupportedCurrencyCodes)[number] | string;

export interface CurrencyMetadata {
  code: string;
  symbol: string;
  name: string;
  minorUnitDecimals: number; // e.g. 2 for NGN/USD, 0 for JPY, 3 for BHD
  symbolPosition: "prefix" | "suffix";
  decimalSeparator: string;
  thousandsSeparator: string;
}

export const CURRENCY_REGISTRY: Record<string, CurrencyMetadata> = {
  NGN: {
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound Sterling",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  KES: {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  GHS: {
    code: "GHS",
    symbol: "GH₵",
    name: "Ghanaian Cedi",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Canadian Dollar",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    minorUnitDecimals: 0,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  BHD: {
    code: "BHD",
    symbol: "BD",
    name: "Bahraini Dinar",
    minorUnitDecimals: 3,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
  KWD: {
    code: "KWD",
    symbol: "KD",
    name: "Kuwaiti Dinar",
    minorUnitDecimals: 3,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  },
};

export function getCurrencyMetadata(code: string): CurrencyMetadata {
  const normalized = code.toUpperCase();
  if (CURRENCY_REGISTRY[normalized]) {
    return CURRENCY_REGISTRY[normalized];
  }
  // Fallback default: standard 2 decimal places
  return {
    code: normalized,
    symbol: normalized + " ",
    name: normalized,
    minorUnitDecimals: 2,
    symbolPosition: "prefix",
    decimalSeparator: ".",
    thousandsSeparator: ",",
  };
}

export const CurrencyCodeSchema = z
  .string()
  .min(3)
  .max(3)
  .transform((val) => val.toUpperCase());
