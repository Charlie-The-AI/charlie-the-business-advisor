# Security Policy

## Supported Packages & Versions

We take the security of Charlie the Business Advisor and all associated packages seriously.

| Package | Supported Versions |
| --- | --- |
| `@charlie/advisor-types` | >= 1.0.0 |
| `@charlie/analytics-core` | >= 1.0.0 |
| `@charlie/analytics-adapters` | >= 1.0.0 |
| `charlie-the-business-advisor` | >= 1.0.0 |
| `@charlie/advisor-sdk` | >= 1.0.0 |
| `@charlie/advisor-react` | >= 1.0.0 |
| Charlie SaaS API (`apps/api`) | Current Production |

## Reporting a Vulnerability

If you discover a security vulnerability within Charlie the Business Advisor:

1. **Do NOT open a public GitHub issue.**
2. Send an email to `security@charlieadvisor.com` with:
   - Detailed description of the vulnerability.
   - Steps to reproduce or proof-of-concept script.
   - Affected package(s) or endpoint(s).
   - Potential impact assessment.
3. We will acknowledge receipt within 48 hours and provide an estimated timeline for remediation.
4. Once resolved, a security advisory will be published along with patched package releases.

## Core Security Commitments

- **No Secret Exposure**: Private API keys and signing secrets must never be committed to source control or exposed in browser bundles.
- **Tenant Isolation**: Multi-tenant data segregation is strictly enforced via business-scoped authorization and database constraints.
- **Data Minimization & AI Privacy**: Personally Identifiable Information (PII) is scrubbed or omitted prior to transmitting analytics summaries to AI language model providers.
- **Deterministic Validation**: Financial figures and analytics payloads are rigorously validated against schemas with zero floating-point arithmetic.
