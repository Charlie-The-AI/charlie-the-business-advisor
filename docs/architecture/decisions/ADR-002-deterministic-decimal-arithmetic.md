# ADR-002: Deterministic Decimal Arithmetic and Minor-Unit Semantics

## Status
Accepted

## Context
Standard IEEE-754 binary floating-point arithmetic in JavaScript results in calculation artifacts (e.g., `0.1 + 0.2 === 0.30000000000000004`). In a financial analytics engine, rounding errors and floating point imprecision undermine trust and violate accounting standards.

## Decision
1. All monetary quantities in inputs, intermediate state, and outputs are represented in **integer minor units** (e.g., cents, kobo, pence) as `bigint` or safe integers, coupled with an ISO-4217 currency code.
2. We implement a dedicated zero-dependency `Money` and `FixedDecimal` calculation engine within `@charlie-the-ai/analytics-core` that:
   - Performs integer addition, subtraction, and multiplication.
   - Performs division with explicit half-up rounding to precision.
   - Provides safe formatting (`formatMinorUnits(2500000, "NGN") => "₦25,000.00"`).
   - Maps currency definitions to decimal exponent factors (e.g. NGN = 2, USD = 2, JPY = 0, BHD = 3).
3. Clear distinction between accounting terms:
   - **Gross Merchandise Value (GMV)**
   - **Recognized Net Revenue**
   - **Cost of Goods Sold (COGS)**
   - **Gross Profit & Gross Margin %**

## Consequences
- Guaranteed deterministic financial metrics across all runtimes and architectures.
- Easy serialization over JSON (integers or stringified integers) without precision degradation.
