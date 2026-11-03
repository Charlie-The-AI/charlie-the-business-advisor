# Charlie the Business Advisor — Technical Architecture

## 1. System Vision

Charlie the Business Advisor is a dual-tier commercial analytics and AI advisory platform:
1. **Tier A (Open-Source Core):** An offline, deterministic TypeScript analytics library (`@charlie/analytics-core`, `@charlie/advisor-types`, `@charlie/analytics-adapters`, and `charlie-the-business-advisor`) that calculates sales volume, revenue recognition, Pareto distributions, customer cohorts, RFM segmentation, product profitability, and moving averages.
2. **Tier B (SaaS Advisory Cloud):** A multi-tenant Laravel 12 API with PostgreSQL, Redis, and an AI advisory orchestration layer that ingests deterministic snapshots, validates data completeness, discovers actionable growth opportunities, and grounds recommendations strictly against verified figures.

## 2. High-Level Component Topology

```mermaid
graph TD
    subgraph ClientApplications ["Client Applications"]
        Web[Next.js Dashboard]
        Mobile[React Native / Mobile App]
        CustomBackends[Custom Node / Laravel / Express Apps]
    end

    subgraph OpenSourceEngine ["Open-Source npm Ecosystem"]
        Types["@charlie/advisor-types\n(Zod Schemas & Contracts)"]
        Core["@charlie/analytics-core\n(Deterministic Analytics Engine)"]
        Adapters["@charlie/analytics-adapters\n(Custom Schema Mapping)"]
        SDK["@charlie/advisor-sdk\n(API Client)"]
        ReactPkg["@charlie/advisor-react\n(React Hooks & Visuals)"]
        Umbrella["charlie-the-business-advisor\n(Unified Entrypoint)"]
    end

    subgraph SaaSPlatform ["Charlie SaaS Platform (Laravel 12 / PostgreSQL / Redis)"]
        Gateway[REST API / Sanctum / Scoped API Tokens]
        Ingest[Snapshot Ingestion Service]
        Queue[Redis Horizon Queue Worker]
        DB[(PostgreSQL Multi-Tenant DB)]
        Billing[Paystack Billing & Entitlements]
        AIOrchestrator[AI Advisory & Grounding Engine]
    end

    subgraph ExternalProviders ["External Services"]
        LLM[OpenAI / Gemini / Anthropic]
        Paystack[Paystack Payment Gateway]
    end

    CustomBackends --> Umbrella
    Umbrella --> Core
    Umbrella --> Adapters
    Core --> Types
    Adapters --> Types
    CustomBackends -->|POST /v1/analytics/snapshots| Gateway
    Web --> SDK
    ReactPkg --> SDK
    SDK --> Gateway

    Gateway --> Ingest
    Ingest --> DB
    Ingest --> Queue
    Queue --> AIOrchestrator
    AIOrchestrator --> LLM
    Gateway --> Billing
    Billing --> Paystack
```

## 3. Data Integrity & Financial Accounting Rules

1. **Integer Minor Units:** All monetary values stored and processed use integer minor units (e.g. cents, kobo) alongside ISO-4217 currency codes. No JavaScript IEEE-754 floating point arithmetic is used for financial totals.
2. **Revenue Recognition:**
   - **Gross Merchandise Value (GMV):** All non-cancelled orders at list price.
   - **Net Sales Recognized:** Orders with status `completed` or `partially_refunded`: items total + tax + shipping - discounts - refund amounts.
   - **Excluded from recognized revenue:** `pending`, `failed`, and `cancelled` orders.
3. **Data Completeness & Zero-Hallucination Policy:**
   - When product cost information is missing, Charlie does not guess COGS or margin; it reports gross profit as `null` with a clear `DATA_INCOMPLETE: MISSING_COGS` signal.
   - When customer identifiers are absent, repeat purchase rates and RFM segments are reported as `insufficient_data` rather than generating artificial numbers.
4. **Evidence Grounding in AI Advisory:**
   - Every numerical metric cited by the AI advisor must match an analytical observation in the stored snapshot.
   - Recommendations that contain ungrounded numbers or impossible percentage gains are rejected by the validation pipeline before being persisted or delivered to users.
