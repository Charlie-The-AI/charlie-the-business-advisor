# Security Policy

## Supported Packages & Versions

We take the security of Charlie the Business Advisor open-source packages seriously.

| Package | Supported Versions |
| --- | --- |
| `@charlie/advisor-types` | >= 0.1.0 |
| `@charlie/analytics-core` | >= 0.1.0 |
| `@charlie/analytics-adapters` | >= 0.1.0 |
| `charlie-the-business-advisor` | >= 0.1.0 |
| `@charlie/advisor-react` | >= 0.1.0 |

---

## Reporting a Vulnerability

If you discover a security vulnerability within Charlie the Business Advisor:

1. **Do NOT open a public GitHub issue.**
2. Send an email to `security@charlieadvisor.com` with:
   - Detailed description of the vulnerability.
   - Steps to reproduce or proof-of-concept script.
   - Affected package(s).
   - Potential impact assessment.
3. We will acknowledge receipt within 48 hours and provide an estimated timeline for remediation.
4. Once resolved, a security advisory will be published along with patched package releases.

---

## Core Security Commitments

- **No Secret Exposure**: Zero private API keys, secrets, or internal URLs in open-source repositories or npm distributions.
- **Data Minimization & Privacy**: Personally Identifiable Information (PII) is not collected by the analytics engine. All computation is performed locally or within the developer's execution context.
- **Deterministic Validation**: Financial figures and analytics payloads are rigorously validated against Zod schemas with zero floating-point arithmetic.
