# ADR-001: Monorepo Architecture and Package Distribution

## Status
Accepted

## Context
Charlie the Business Advisor consists of multiple open-source TypeScript packages, a multi-tenant Laravel SaaS backend, a Next.js customer dashboard, and example integration applications. We need a development and deployment strategy that allows:
1. Publishing open-source npm packages independently without leaking proprietary SaaS backend code.
2. Code sharing between data contracts, core algorithms, and client libraries.
3. Clean boundaries between backend, frontend, and packages.

## Decision
We adopt a monorepo structure managed by `pnpm` workspaces and `turbo`:
- `packages/advisor-types`: Data contracts, Zod schemas, domain models.
- `packages/analytics-core`: Deterministic business intelligence and analytics calculation engine.
- `packages/analytics-adapters`: Data mapping and normalization layer.
- `packages/charlie-the-business-advisor`: Main public entrypoint npm package re-exporting core and adapter functions.
- `packages/advisor-sdk`: Official TypeScript API client for the SaaS.
- `packages/advisor-react`: React hooks and headless/styled components.
- `apps/api`: Multi-tenant SaaS backend (Laravel 12 / PHP 8.3).
- `apps/dashboard`: Next.js 15 SaaS dashboard.

## Consequences
- Open-source packages can be built, tested, and published to npm via standard CI/CD.
- Proprietary SaaS backend logic remains decoupled and isolated.
- Zero cyclic dependencies between packages.
