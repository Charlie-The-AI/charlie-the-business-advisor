# @charlie-the-ai/analytics-adapters 🔌

> Declarative and functional data normalization pipeline for Charlie the Business Advisor.

[![npm version](https://img.shields.io/npm/v/@charlie-the-ai/analytics-adapters.svg)](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`@charlie-the-ai/analytics-adapters` bridges external data systems (PostgreSQL, MySQL, MongoDB, Laravel Eloquent, Stripe webhooks, Shopify APIs, CSV exports) into Charlie's strongly typed, minor-unit validated `Order` structures.

### Key Features

- **Declarative Field Mapping**: Map fields using property key paths (e.g., `"customer.email"`) or accessor functions `(o) => o.created_at`.
- **Automatic Decimal-to-Minor-Unit Conversion**: Accepts either major decimal amounts (`price: 49.99` via `unitPriceMajorUnits`) or pre-calculated integer minor units (`unitPriceMinorUnits: 4999`).
- **Flexible Status Normalization**: Intelligently converts platform-specific statuses (`"paid"`, `"fulfilled"`, `"processing"`, `"void"`) to canonical Charlie statuses (`"completed"`, `"pending"`, `"cancelled"`, `"refunded"`, `"failed"`).
- **Batch Normalization & Error Isolation**: `normalizeBatch` processes arrays of records, deduplicates order IDs, isolates corrupted rows with detailed issue reports, and returns valid orders.
- **Pre-Built Presets**: Includes ready-to-use adapters for frameworks like **Laravel Eloquent**.

---

## Installation

```bash
# npm
npm install @charlie-the-ai/analytics-adapters @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# pnpm
pnpm add @charlie-the-ai/analytics-adapters @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# yarn
yarn add @charlie-the-ai/analytics-adapters @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core
```

---

## Usage Examples

### 1. Custom Database / API Adapter

```typescript
import { createOrderAdapter } from "@charlie-the-ai/analytics-adapters";

// Your raw database or API row structure
interface CustomDatabaseRow {
  order_reference: string;
  user_email: string;
  order_status: string;
  charge_amount: number; // e.g. 199.50 in major dollars
  created_time: string;
  lines: Array<{
    item_id: string;
    item_title: string;
    qty: number;
    amount: number; // e.g. 199.50
  }>;
}

const adapter = createOrderAdapter<CustomDatabaseRow>({
  id: "order_reference",
  customerEmail: "user_email",
  status: (row) => row.order_status,
  currency: () => "USD",
  createdAt: "created_time",
  totalMajorUnits: "charge_amount", // Automatically converted to integer cents (19950)
  items: "lines",
  itemConfig: {
    id: "item_id",
    productId: "item_id",
    productName: "item_title",
    quantity: "qty",
    unitPriceMajorUnits: "amount",
  },
});

// Normalize a single record
const result = adapter.normalize(rawRow);
if (result.success) {
  console.log("Normalized Order:", result.data);
} else {
  console.error("Validation issues:", result.errors);
}

// Normalize a batch of records
const batch = adapter.normalizeBatch(rawRows);
console.log(`Processed ${batch.totalProcessed} records:`);
console.log(`- Successfully normalized: ${batch.orders.length}`);
console.log(`- Validation errors: ${batch.errors.length}`);
console.log(`- Duplicate records skipped: ${batch.duplicateCount}`);
```

### 2. Laravel Eloquent Preset

A pre-configured adapter for Laravel vendor order schemas with related items:

```typescript
import { createLaravelOrderAdapter } from "@charlie-the-ai/analytics-adapters";

const laravelAdapter = createLaravelOrderAdapter("NGN");

const rawLaravelOrders = [
  {
    id: 1045,
    vendor_id: 12,
    customer: {
      id: 55,
      name: "Amina Bello",
      email: "amina@example.com",
    },
    status: "paid", // Mapped to "completed"
    currency: "NGN",
    total_amount: 45000.00, // Converted to 4500000 kobo
    tax_amount: 3375.00,
    created_at: "2026-03-20 14:32:00",
    order_items: [
      {
        id: 301,
        order_id: 1045,
        product_id: 88,
        product_name: "Artisan Leather Bag",
        quantity: 1,
        price: 45000.00,
        cost_price: 25000.00,
      },
    ],
  },
];

const { orders, errors } = laravelAdapter.normalizeBatch(rawLaravelOrders);
console.log("Normalized for Charlie:", orders[0]);
```

---

## Status Normalization Rules

`@charlie-the-ai/analytics-adapters` handles diverse status strings:

| Raw Status Input | Normalized Charlie Status | Included in Revenue? |
| :--- | :--- | :--- |
| `completed`, `paid`, `delivered`, `fulfilled`, `success` | `completed` | Yes |
| `pending`, `processing`, `unpaid`, `open` | `pending` | No |
| `cancelled`, `void`, `voided` | `cancelled` | No |
| `refunded` | `refunded` | Deducted |
| `failed`, `declined` | `failed` | No |

---

## Related Packages

- [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types): Target schemas and data contracts.
- [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core): Analytics calculation engine.
- [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor): The unified umbrella SDK.

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
