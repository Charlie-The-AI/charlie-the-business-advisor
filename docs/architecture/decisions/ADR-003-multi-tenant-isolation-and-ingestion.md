# ADR-003: Multi-Tenant Isolation and Analytics Snapshot Ingestion

## Status
Accepted

## Context
Charlie SaaS operates as a B2B SaaS where organizations own one or more businesses (e.g. e-commerce stores, branches, marketplace vendor accounts). API keys and analytics snapshots must never cross business boundaries. Furthermore, ingestion payloads may be large, necessitating both synchronous lightweight validation and asynchronous background processing.

## Decision
1. **Tenant Hierarchy**:
   `Organization` (Billing entity, owners/members) -> `Business` (Storefront/store entity) -> `BusinessData` (Snapshots, Recommendations, Conversations, AuditLogs).
2. **API Authentication**:
   Scoped API keys formatted as `cta_live_[prefix]_[secret]` or `cta_test_[prefix]_[secret]`. Only the SHA-256 hash of the secret is persisted. Each key is tied to a specific Organization and scoped to specific Businesses with designated permission scopes (e.g., `snapshots:write`, `recommendations:read`).
3. **Idempotent Snapshot Ingestion**:
   `POST /v1/analytics/snapshots` accepts an idempotency key and generates a SHA-256 fingerprint of the normalized snapshot. Duplicate submissions within 24 hours return the existing snapshot record without redundant processing or charges.
4. **Queue-Backed Processing**:
   Heavy recommendation synthesis and LLM orchestration are dispatched to Redis Horizon background queues with retry backoff and failure isolation.

## Consequences
- Strict database constraints and tenant-aware Eloquent scopes prevent cross-tenant data leakage.
- High ingestion throughput without stalling HTTP request cycles.
