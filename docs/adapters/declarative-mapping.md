# Declarative Field Mapping

Declarative adapters let you map database rows or API responses to `CharlieOrder` and `CharlieCustomer` without writing repetitive boilerplate code.

Package: `@charlie-the-ai/analytics-adapters`

---

## 1. Creating a Declarative Order Adapter

Use `createOrderAdapter` with a `fields` configuration:

```typescript
import { createOrderAdapter } from "charlie-the-business-advisor";

interface DbOrderRow {
  invoice_number: string;
  user_uuid: string;
  checkout_date: string;
  order_status: string;
  currency_code: string;
  final_amount: number; // e.g. 150.50 (USD major units)
  line_items: Array<{
    item_sku: string;
    description: string;
    qty: number;
    price: number;
  }>;
}

const orderAdapter = createOrderAdapter<DbOrderRow>({
  fields: {
    // Direct column mapping
    id: "invoice_number",
    customerId: "user_uuid",
    placedAt: "checkout_date",
    currency: "currency_code",

    // Functional accessor for custom status mapping
    status: (row) => (row.order_status === "PAID" ? "completed" : "pending"),

    // Automatic major-to-minor currency conversion ($150.50 -> 15050 cents)
    totalMajor: "final_amount",
    subtotalMajor: "final_amount",

    // Nested line items mapping
    items: (row) =>
      row.line_items.map((item) => ({
        productId: item.item_sku,
        productName: item.description,
        quantity: item.qty,
        unitPriceMinor: Math.round(item.price * 100),
      })),
  },
});

// Transform a single row:
const charlieOrder = orderAdapter.transform(dbRow);

// Transform an array of rows:
const orders = orderAdapter.transformMany(dbRows);
```

---

## 2. Supported Declarative Fields

| Field | Description | Type / Accepted Value |
|---|---|---|
| `id` | Unique order identifier | Column name or function returning string |
| `customerId` | Customer identifier | Column name or function returning string |
| `placedAt` | Order creation timestamp | Column name or function returning ISO string, Date, or timestamp |
| `currency` | Currency code | Column name, static string (e.g. `"USD"`), or function |
| `status` | Order lifecycle status | Column name or function returning `"completed"`, `"pending"`, etc. |
| `totalMinor` | Total in minor units (cents/kobo) | Column name or function returning integer |
| `totalMajor` | Total in major units ($ / ₦) | Column name or function (automatically converted to minor) |
| `subtotalMinor` | Subtotal before tax/shipping in minor units | Column name or function |
| `subtotalMajor` | Subtotal in major units | Column name or function |
| `items` | Line items list | Column name or function returning `CharlieOrderItem[]` |
| `tags` | Category/classification tags | Column name or function returning `string[]` |

---

## 3. Creating a Declarative Customer Adapter

```typescript
import { createCustomerAdapter } from "charlie-the-business-advisor";

interface DbUserRow {
  uuid: string;
  first_name: string;
  last_name: string;
  email_address: string;
  joined_at: string;
  shipping_address: {
    country_iso: string;
    state: string;
  };
}

const customerAdapter = createCustomerAdapter<DbUserRow>({
  fields: {
    id: "uuid",
    name: (row) => `${row.first_name} ${row.last_name}`.trim(),
    email: "email_address",
    createdAt: "joined_at",
    country: "shipping_address.country_iso", // Dot-notated deep path
    region: "shipping_address.state",
  },
});

const customers = customerAdapter.transformMany(dbUserRows);
```
