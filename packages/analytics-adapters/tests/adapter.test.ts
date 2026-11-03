import { describe, it, expect } from "vitest";
import { createOrderAdapter } from "../src/adapter.js";
import { createLaravelOrderAdapter, LaravelOrderRecord } from "../src/presets/laravel.js";

describe("Analytics Data Adapters", () => {
  it("normalizes arbitrary source structures with declarative mapping", () => {
    interface CustomStoreOrder {
      order_number: string;
      shopper: {
        id: string;
        email: string;
        full_name: string;
      };
      state: string;
      currency_code: string;
      date_created: string;
      amount_paid: number; // e.g. 150.00 USD
      line_items: Array<{
        sku_id: string;
        title: string;
        dept: string;
        qty: number;
        unit_price: number;
      }>;
    }

    const adapter = createOrderAdapter<CustomStoreOrder, CustomStoreOrder["line_items"][number]>({
      id: "order_number",
      customerId: "shopper.id",
      customerEmail: "shopper.email",
      customerName: "shopper.full_name",
      status: "state",
      currency: "currency_code",
      createdAt: "date_created",
      totalMajorUnits: "amount_paid",
      items: "line_items",
      itemConfig: {
        id: "sku_id",
        productId: "sku_id",
        productName: "title",
        category: "dept",
        quantity: "qty",
        unitPriceMajorUnits: "unit_price",
      },
    });

    const raw: CustomStoreOrder = {
      order_number: "ORD-90210",
      shopper: {
        id: "usr_42",
        email: "shopper@test.com",
        full_name: "Jane Shopper",
      },
      state: "paid", // will be normalized to "completed"
      currency_code: "USD",
      date_created: "2026-03-10T12:00:00Z",
      amount_paid: 150.0,
      line_items: [
        {
          sku_id: "SKU-BLUE-JEANS",
          title: "Slim Fit Blue Jeans",
          dept: "Apparel",
          qty: 2,
          unit_price: 75.0,
        },
      ],
    };

    const res = adapter.normalize(raw);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.data.id).toBe("ORD-90210");
    expect(res.data.status).toBe("completed");
    expect(res.data.customerId).toBe("usr_42");
    expect(res.data.currency).toBe("USD");
    expect(res.data.totalMinorUnits).toBe(15000); // $150.00 = 15,000 cents
    expect(res.data.items[0]?.totalPriceMinorUnits).toBe(15000);
    expect(res.data.items[0]?.category).toBe("Apparel");
  });

  it("normalizes Laravel Eloquent vendor orders using preset", () => {
    const laravelAdapter = createLaravelOrderAdapter("NGN");

    const rawLaravelOrder: LaravelOrderRecord = {
      id: 4821,
      vendor_id: 12,
      user_id: 88,
      customer: {
        id: 88,
        email: "tola@example.ng",
        name: "Tola Oladipo",
      },
      status: "fulfilled", // maps to "completed"
      currency: "NGN",
      total_amount: 45000.0, // ₦45,000.00
      shipping_fee: 2500.0,
      tax_amount: 0.0,
      created_at: "2026-03-12T15:30:00Z",
      order_items: [
        {
          id: 991,
          order_id: 4821,
          product_id: 104,
          name: "Solar Power Bank 20000mAh",
          sku: "PWR-BNK-01",
          category: "Electronics",
          quantity: 1,
          price: 42500.0,
          cost_price: 28000.0, // COGS available
        },
      ],
    };

    const res = laravelAdapter.normalize(rawLaravelOrder);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.data.id).toBe("4821");
    expect(res.data.businessId).toBe("vendor_12");
    expect(res.data.customerId).toBe("88");
    expect(res.data.status).toBe("completed");
    expect(res.data.totalMinorUnits).toBe(4500000); // ₦45,000.00 = 4,500,000 kobo
    expect(res.data.items[0]?.unitCostMinorUnits).toBe(2800000); // ₦28,000.00 COGS
  });

  it("handles batch normalization with deduplication and error isolation", () => {
    const laravelAdapter = createLaravelOrderAdapter("NGN");

    const batch: LaravelOrderRecord[] = [
      {
        id: 1,
        status: "paid",
        total_amount: 10000,
        created_at: "2026-03-01T10:00:00Z",
        order_items: [
          { id: 1, order_id: 1, product_id: 1, name: "Item 1", quantity: 1, price: 10000 },
        ],
      },
      // Duplicate of id 1
      {
        id: 1,
        status: "paid",
        total_amount: 10000,
        created_at: "2026-03-01T10:00:00Z",
        order_items: [
          { id: 1, order_id: 1, product_id: 1, name: "Item 1", quantity: 1, price: 10000 },
        ],
      },
      // Invalid record (invalid date)
      {
        id: 2,
        status: "paid",
        total_amount: 10000,
        created_at: "not-a-date",
        order_items: [],
      },
      // Valid record
      {
        id: 3,
        status: "paid",
        total_amount: 25000,
        created_at: "2026-03-02T10:00:00Z",
        order_items: [
          { id: 3, order_id: 3, product_id: 2, name: "Item 2", quantity: 1, price: 25000 },
        ],
      },
    ];

    const result = laravelAdapter.normalizeBatch(batch, { deduplicate: true, skipInvalid: true });
    expect(result.totalProcessed).toBe(4);
    expect(result.orders.length).toBe(2); // IDs 1 and 3
    expect(result.duplicateCount).toBe(1); // Second copy of ID 1
    expect(result.errors.length).toBe(1); // ID 2 failed validation
  });
});
