# Laravel Eloquent & SQL Database Adapter

Charlie includes built-in support for mapping Eloquent models (from Laravel, WooCommerce, Bagisto, or custom PHP backends) into Charlie's canonical datasets.

Package: `@charlie-the-ai/analytics-adapters`

---

## 1. Built-in Laravel Order Adapter

Use `createLaravelOrderAdapter` or `charlie.laravelAdapter()`:

```typescript
import { Charlie, createLaravelOrderAdapter } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "NGN" });
const laravelAdapter = charlie.laravelAdapter("NGN");
```

### Supported Eloquent Schema Conventions

The Laravel adapter automatically recognizes standard Laravel field names:

| Charlie Field | Recognized Eloquent Attributes |
|---|---|
| `id` | `id`, `uuid`, `order_number`, `reference` |
| `customerId` | `customer_id`, `user_id` |
| `placedAt` | `created_at`, `ordered_at`, `paid_at` |
| `currency` | `currency`, `currency_code` (defaults to adapter currency) |
| `status` | `status` (maps `'completed'`, `'paid'`, `'delivered'`, `'fulfilled'` to `'completed'`) |
| `total` | `total`, `grand_total`, `amount`, `total_amount` |
| `items` | Relation array: `items`, `order_items`, `line_items` |
| Item `productId` | `product_id`, `item_id`, `sku` |
| Item `productName` | `product_name`, `name`, `title` |
| Item `unitPrice` | `unit_price`, `price` |
| Item `quantity` | `quantity`, `qty` |

---

## 2. Transforming Eloquent JSON Payloads

In Laravel, serialize your models to JSON:

```php
$orders = Order::with(['items', 'customer'])
    ->where('created_at', '>=', now()->subDays(30))
    ->get()
    ->toArray();
```

In your Node.js or Next.js service:

```typescript
const charlieOrders = laravelAdapter.normalizeBatch(orders);

const snapshot = charlie.analyze({
  orders: charlieOrders,
  currency: "NGN",
});
```
