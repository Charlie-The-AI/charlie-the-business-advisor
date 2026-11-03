# Contributing to Charlie the Business Advisor

Thank you for your interest in contributing to Charlie the Business Advisor!

This repository contains the open-source business analytics engine and developer SDKs:
- Open-source packages (`packages/*`)
- Framework integration examples (`examples/*`)

---

## Development Prerequisites

- **Node.js**: >= 20 LTS (Node 22 LTS recommended)
- **pnpm**: >= 10.x / 12.x
- **Git**: 2.30+

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/charlie/charlie-the-business-advisor.git
   cd charlie-the-business-advisor
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm run build
   ```

4. Run tests:
   ```bash
   pnpm run test
   ```

5. Type check:
   ```bash
   pnpm run typecheck
   ```

---

## Code Guidelines

- **Strict TypeScript**: No `any` types. Ensure all models, options, and returns have explicit or strictly inferred types.
- **Financial Calculations**: Never use native JavaScript floating-point arithmetic for monetary calculations. Always use integer minor units and deterministic arithmetic helpers.
- **Deterministic Analytics**: Financial metrics must be testable, reproducible, and verifiable.
- **Test-Driven**: Every analytics metric and adapter transformation must have automated unit tests covering typical cases, boundary conditions, empty datasets, and negative/refund scenarios.
- **No Hallucinated Metrics**: Missing customer identifiers or missing product cost figures must produce explicit insufficient-data signals rather than dummy defaults.
- **Clean Boundaries**: Open-source packages must remain completely decoupled from proprietary hosted SaaS infrastructure.
