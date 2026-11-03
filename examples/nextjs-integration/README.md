# Charlie Next.js Integration Example

This example demonstrates how to integrate `@charlie-the-ai/advisor-react` into a Next.js 15 App Router application.

## Key Features Demonstrated

1. **`CharlieProvider` Context**: Global configuration for default currency, timezone, and business ID.
2. **`useBusinessAnalytics` Hook**: Real-time deterministic calculation of net sales revenue, AOV, and customer metrics directly in React.
3. **`ParetoChart` Component**: Visual representation of the 80/20 revenue concentration law.
4. **`RecommendationWidget` Component**: Actionable AI growth recommendations with interactive lifecycle decision triggers.

## Quickstart

```bash
# Run development server
pnpm --filter=example-nextjs-integration run dev

# Build for production
pnpm --filter=example-nextjs-integration run build
```
