import { describe, it, expect } from "vitest";
import { createOrderAdapter, createCustomerAdapter } from "../src/adapter.js";
import { createLaravelOrderAdapter, LaravelOrderRecord } from "../src/presets/laravel.js";

describe("Analytics Data Adapters", () => {
  it("supports Developer A schema with declarative mapping", () => {
    // Developer A: orders table with total_amount, created_at
    interface DevAOrder {
      order_id: string;
      user_id: string;
      created_at: string;
      order_status: string;
      total_amount_kobo: number;
      order_lines: Array<{
        sku: string;
        title: string;
        qty: number;
        price_kobo: number;
      }>;
    }

    const adapter = createOrderAdapter<DevAOrder, DevAOrder["order_lines"][number]>({
      fields: {
        id: "order_id",
        customerId: "user_id",
        placedAt: "created_at",
        status: "order_status",
        currency: () => "NGN",
        totalMinor: "total_amount_kobo",
        subtotalMinor: "total_amount_kobo",
        items: "order_lines",
      },
      itemFields: {
        productId: "sku",
        productName: "title",
        quantity: "qty",
        unitPriceMinor: "price_kobo",
      },
      statusMapping: {
        paid: "completed",
        pending: "pending",
        cancelled: "cancelled",
      },
    });

    const raw: DevAOrder = {
      order_id: "ORD-A101",
      user_id: "USER-1",
      created_at: "2026-11-01T10:00:00Z",
      order_status: "paid",
      total_amount_kobo: 500000, // ₦5,000.00
      order_lines: [
        {
          sku: "FOOD-JOL",
          title: "Party Jollof",
          qty: 2,
          price_kobo: 250000,
        },
      ],
    };

    const order = adapter.transform(raw);
    expect(order.id).toBe("ORD-A101");
    expect(order.customerId).toBe("USER-1");
    expect(order.status).toBe("completed");
    expect(order.currency).toBe("NGN");
    expect(order.totalMinor).toBe(500000);
    expect(order.subtotalMinor).toBe(500000);
    expect(order.items[0]?.productName).toBe("Party Jollof");
  });

  it("supports Developer B schema with custom transformation function", () => {
    // Developer B: transactions table with amount_paid, payment_date
    interface DevBTransaction {
      tx_ref: string;
      client: { uuid: string; email_address: string };
      payment_date: Date;
      gateway_status: string;
      amount_paid_naira: number; // 15,000.50 (major units)
    }

    const adapter = createOrderAdapter<DevBTransaction>({
      transform: (tx) => ({
        id: tx.tx_ref,
        customerId: tx.client.uuid,
        placedAt: tx.payment_date.toISOString(),
        currency: "NGN",
        status: tx.gateway_status === "SUCCESS" ? "completed" : "pending",
        items: [],
        subtotalMinor: Math.round(tx.amount_paid_naira * 100),
        discountMinor: 0,
        taxMinor: 0,
        shippingMinor: 0,
        totalMinor: Math.round(tx.amount_paid_naira * 100),
        refundedMinor: 0,
      }),
    });

    const raw: DevBTransaction = {
      tx_ref: "TX-9988",
      client: { uuid: "CUS-88", email_address: "buyer@example.com" },
      payment_date: new Date("2026-11-02T15:00:00Z"),
      gateway_status: "SUCCESS",
      amount_paid_naira: 15000.5,
    };

    const order = adapter.transform(raw);
    expect(order.id).toBe("TX-9988");
    expect(order.customerId).toBe("CUS-88");
    expect(order.status).toBe("completed");
    expect(order.totalMinor).toBe(1500050); // 15000.50 * 100
  });

  it("supports Customer Adapters with declarative mapping and custom transforms", () => {
    interface RawCustomerRow {
      account_id: string;
      registered_on: string;
      profile: {
        first_name: string;
        last_name: string;
        contact_email: string;
      };
      location_country: string;
      location_state: string;
    }

    const customerAdapter = createCustomerAdapter<RawCustomerRow>({
      fields: {
        id: "account_id",
        createdAt: "registered_on",
        name: (row) => `${row.profile.first_name} ${row.profile.last_name}`,
        email: "profile.contact_email",
        country: "location_country",
        region: "location_state",
      },
    });

    const rawCustomer: RawCustomerRow = {
      account_id: "ACC-500",
      registered_on: "2026-05-10T08:00:00Z",
      profile: {
        first_name: "Ade",
        last_name: "Ogunlesi",
        contact_email: "ade@example.ng",
      },
      location_country: "NG",
      location_state: "Ogun",
    };

    const customer = customerAdapter.transform(rawCustomer);
    expect(customer.id).toBe("ACC-500");
    expect(customer.name).toBe("Ade Ogunlesi");
    expect(customer.email).toBe("ade@example.ng");
    expect(customer.country).toBe("NG");
    expect(customer.region).toBe("Ogun");
  });

  it("handles batch transformations with strict and lenient error isolation", () => {
    const adapter = createOrderAdapter<{ id: string; date: string; amount: number }>({
      fields: {
        id: "id",
        placedAt: "date",
        totalMinor: "amount",
        subtotalMinor: "amount",
        status: () => "completed",
        currency: () => "USD",
      },
    });

    const records = [
      { id: "O-1", date: "2026-11-01T00:00:00Z", amount: 1000 },
      { id: "O-2", date: "invalid-date", amount: 2000 }, // Corrupted
      { id: "O-1", date: "2026-11-01T00:00:00Z", amount: 1000 }, // Duplicate
      { id: "O-3", date: "2026-11-02T00:00:00Z", amount: 3000 },
    ];

    // Lenient mode
    const batch = adapter.safeTransformMany(records, { strict: false, deduplicate: true });
    expect(batch.totalProcessed).toBe(4);
    expect(batch.acceptedCount).toBe(2); // O-1 and O-3
    expect(batch.rejectedCount).toBe(1); // O-2
    expect(batch.duplicateCount).toBe(1); // O-1 duplicate

    // Strict mode should throw on corrupted records
    expect(() => adapter.safeTransformMany(records, { strict: true })).toThrow();
  });

  it("maintains full backwards compatibility with legacy createLaravelOrderAdapter", () => {
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
      total_amount: 45000.0,
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
          cost_price: 28000.0,
        },
      ],
    };

    const res = laravelAdapter.normalize(rawLaravelOrder);
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.data.id).toBe("4821");
    expect(res.data.status).toBe("completed");
    expect(res.data.totalMinorUnits).toBe(4500000);
  });
});
