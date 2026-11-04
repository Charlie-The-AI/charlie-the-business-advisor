import { describe, it, expect } from "vitest";
import {
  CharlieOrderSchema,
  CharlieCustomerSchema,
  CharlieOrderStatusSchema,
  toCharlieOrder,
  toCharlieCustomer,
  AVAILABLE_DATASETS,
  COMING_SOON_DATASETS,
} from "../src/index.js";

describe("CharlieOrder Dataset Contract", () => {
  it("validates a complete, valid CharlieOrder", () => {
    const rawOrder = {
      id: "ORD-001",
      customerId: "CUS-001",
      placedAt: "2026-11-01T10:30:00Z",
      currency: "NGN",
      status: "completed",
      items: [
        {
          productId: "FOOD-001",
          productName: "Jollof Rice",
          quantity: 2,
          unitPriceMinor: 350000, // ₦3,500.00
          discountMinor: 0,
        },
      ],
      subtotalMinor: 700000, // ₦7,000.00
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor: 700000,
      refundedMinor: 0,
    };

    const parsed = CharlieOrderSchema.parse(rawOrder);
    expect(parsed.id).toBe("ORD-001");
    expect(parsed.customerId).toBe("CUS-001");
    expect(parsed.currency).toBe("NGN");
    expect(parsed.totalMinor).toBe(700000);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.unitPriceMinor).toBe(350000);
  });

  it("supports anonymous / guest checkout orders (customerId: null)", () => {
    const rawOrder = {
      id: "ORD-ANON",
      customerId: null,
      placedAt: "2026-11-02T12:00:00Z",
      currency: "USD",
      status: "completed",
      items: [],
      subtotalMinor: 5000,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor: 5000,
      refundedMinor: 0,
    };

    const parsed = CharlieOrderSchema.parse(rawOrder);
    expect(parsed.customerId).toBeNull();
    expect(parsed.items).toEqual([]);
  });

  it("supports zero-decimal currencies like JPY", () => {
    const rawOrder = {
      id: "ORD-JPY",
      customerId: "CUS-TOKYO",
      placedAt: "2026-11-02T14:00:00Z",
      currency: "JPY",
      status: "completed",
      items: [
        {
          productId: "TEA-01",
          productName: "Matcha Tea",
          quantity: 1,
          unitPriceMinor: 1500, // ¥1,500
        },
      ],
      subtotalMinor: 1500,
      discountMinor: 0,
      taxMinor: 150,
      shippingMinor: 500,
      totalMinor: 2150,
      refundedMinor: 0,
    };

    const parsed = CharlieOrderSchema.parse(rawOrder);
    expect(parsed.currency).toBe("JPY");
    expect(parsed.totalMinor).toBe(2150);
  });

  it("rejects invalid status", () => {
    const rawOrder = {
      id: "ORD-BAD-STATUS",
      customerId: "CUS-1",
      placedAt: "2026-11-01T10:00:00Z",
      currency: "USD",
      status: "unknown_status",
      subtotalMinor: 1000,
      totalMinor: 1000,
    };

    expect(() => CharlieOrderSchema.parse(rawOrder)).toThrow();
  });

  it("rejects negative monetary values", () => {
    const rawOrder = {
      id: "ORD-NEG",
      customerId: "CUS-1",
      placedAt: "2026-11-01T10:00:00Z",
      currency: "USD",
      status: "completed",
      subtotalMinor: -500,
      totalMinor: 1000,
    };

    expect(() => CharlieOrderSchema.parse(rawOrder)).toThrow();
  });

  it("rejects when refundedMinor exceeds total payable amount", () => {
    const rawOrder = {
      id: "ORD-OVER-REFUND",
      customerId: "CUS-1",
      placedAt: "2026-11-01T10:00:00Z",
      currency: "USD",
      status: "refunded",
      subtotalMinor: 1000,
      totalMinor: 1000,
      shippingMinor: 0,
      taxMinor: 0,
      refundedMinor: 2000, // Cannot refund $20 on a $10 order
    };

    expect(() => CharlieOrderSchema.parse(rawOrder)).toThrow(/refundedMinor cannot exceed/);
  });

  it("rejects non-ISO 4217 currencies", () => {
    const rawOrder = {
      id: "ORD-FAKE-CUR",
      customerId: "CUS-1",
      placedAt: "2026-11-01T10:00:00Z",
      currency: "XYZABC",
      status: "completed",
      subtotalMinor: 1000,
      totalMinor: 1000,
    };

    expect(() => CharlieOrderSchema.parse(rawOrder)).toThrow();
  });

  it("converts legacy Order format to CharlieOrder seamlessly", () => {
    const legacyOrder = {
      id: "LEGACY-001",
      customerId: "CUS-99",
      createdAt: "2026-10-15T09:00:00Z",
      currency: "USD" as const,
      status: "completed" as const,
      subtotalMinorUnits: 4500,
      totalMinorUnits: 4500,
      items: [
        {
          id: "item-1",
          productId: "PROD-1",
          productName: "Notebook",
          quantity: 3,
          unitPriceMinorUnits: 1500,
          totalPriceMinorUnits: 4500,
        },
      ],
    };

    const converted = toCharlieOrder(legacyOrder);
    expect(converted.id).toBe("LEGACY-001");
    expect(converted.placedAt).toBe("2026-10-15T09:00:00Z");
    expect(converted.totalMinor).toBe(4500);
    expect(converted.subtotalMinor).toBe(4500);
    expect(converted.items[0]?.unitPriceMinor).toBe(1500);
  });
});

describe("CharlieCustomer Dataset Contract", () => {
  it("validates a complete CharlieCustomer", () => {
    const rawCustomer = {
      id: "CUS-001",
      createdAt: "2026-01-10T08:00:00Z",
      name: "Chidi Anagonye",
      email: "chidi@example.com",
      country: "NG",
      region: "Lagos",
      metadata: { tier: "vip" },
    };

    const parsed = CharlieCustomerSchema.parse(rawCustomer);
    expect(parsed.id).toBe("CUS-001");
    expect(parsed.name).toBe("Chidi Anagonye");
    expect(parsed.email).toBe("chidi@example.com");
    expect(parsed.country).toBe("NG");
  });

  it("validates minimal CharlieCustomer with only mandatory ID", () => {
    const minimal = { id: "CUS-MIN" };
    const parsed = CharlieCustomerSchema.parse(minimal);
    expect(parsed.id).toBe("CUS-MIN");
    expect(parsed.email).toBeUndefined();
  });

  it("converts legacy Customer format to CharlieCustomer seamlessly", () => {
    const legacyCustomer = {
      id: "CUS-LEGACY",
      createdAt: "2026-02-01T00:00:00Z",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1234567890",
      totalOrders: 5,
      totalSpendMinorUnits: 50000,
    };

    const converted = toCharlieCustomer(legacyCustomer);
    expect(converted.id).toBe("CUS-LEGACY");
    expect(converted.name).toBe("Jane Doe");
    expect(converted.email).toBe("jane@example.com");
  });
});

describe("Dataset Catalog", () => {
  it("documents Available Datasets", () => {
    expect(AVAILABLE_DATASETS).toHaveLength(2);
    expect(AVAILABLE_DATASETS.map((d) => d.name)).toEqual(["CharlieOrder", "CharlieCustomer"]);
  });

  it("documents Coming Soon Datasets without fake APIs", () => {
    const names = COMING_SOON_DATASETS.map((d) => d.name);
    expect(names).toContain("CharlieProduct");
    expect(names).toContain("CharliePayment");
    expect(names).toContain("CharlieBooking");
    expect(names).toContain("CharlieExpense");
    expect(names).toContain("CharlieSubscription");
  });
});
