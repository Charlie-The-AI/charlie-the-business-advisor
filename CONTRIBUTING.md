# Contributing to Charlie the Business Advisor

Thank you for your interest in contributing to Charlie the Business Advisor!

Charlie is organized as a monorepo containing:
- Open-source packages (`packages/*`)
- Applications (`apps/*`)
- Integration examples (`examples/*`)

## Development Prerequisites

- Node.js >= 20 LTS (Node 22 LTS or Node 24 recommended)
- pnpm >= 9.x / 10.x / 12.x
- PHP >= 8.2 (for SaaS API development)
- Docker & Docker Compose (optional for local multi-service development)

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

## Code Guidelines

- **Strict TypeScript**: No `any` types. Ensure all models, options, and returns have explicit or strictly inferred types.
- **Financial Calculations**: Never use native JavaScript floating-point arithmetic for monetary calculations. Always use integer minor units and the deterministic `Money` arithmetic helpers.
- **Test-Driven**: Every analytics metric and adapter transformation must have automated unit tests covering typical cases, boundary conditions, empty datasets, and negative/refund scenarios.
- **No Hallucinated Metrics**: Missing customer identifiers or missing product cost figures must produce explicit insufficient-data signals rather than dummy defaults.
