# Troubleshooting & Common Issues

Solutions to common configuration and runtime questions when working with Charlie.

---

## 1. Currency Display Issues (Numbers are 100x Too Large)

### Symptom
An order for `$50.00` appears as `$5,000.00` in the output.

### Cause
Charlie uses **minor currency units** (cents / kobo).
- If your database stores amounts in major units (`50.00`), you must map it using `totalMajor` instead of `totalMinor`, or multiply by 100 (`Math.round(val * 100)`).

### Fix
```typescript
const adapter = createOrderAdapter({
  fields: {
    // Correct for floating-point dollar amounts:
    totalMajor: "amount_dollars",
  },
});
```

---

## 2. Recommendation Status is "flagged"

### Symptom
A recommendation has `groundingStatus: "flagged"`.

### Cause
The AI provider attempted to cite a numerical statistic (e.g. gross sales or repeat customer rate) that does not match the deterministic snapshot numbers within acceptable mathematical tolerance.

### Fix
1. Inspect the warnings in `result.limitations` to see which cited number diverged from the snapshot.
2. Ensure you are using temperature $\le 0.2$ for deterministic AI behavior.
3. If using custom models, instruct the model to only cite metrics present in the provided `analyticsContext`.

---

## 3. "Cannot find module 'charlie-the-business-advisor'"

### Fix
Ensure packages are installed:
```bash
npm install charlie-the-business-advisor
```
If using pnpm monorepo:
```bash
pnpm install
```

---

## 4. Customer PII Exposure Concern

### Question
"Will my customer emails or phone numbers be sent to OpenAI or Anthropic?"

### Answer
**No.** By default, Charlie automatically masks customer identifiers (`Customer Cohort #1`) and scrubs emails and phone numbers before generating AI prompts.
