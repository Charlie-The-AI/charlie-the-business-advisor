import { Order } from "@charlie/advisor-types";

export function createMockOrders(): Order[] {
  return [
    // Completed Order 1: Alice buys 2 Ergonomic Chairs
    {
      id: "ord_001",
      businessId: "biz_999",
      customerId: "cust_alice",
      customerName: "Alice Adeleke",
      customerEmail: "alice@example.com",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-01T09:00:00Z",
      completedAt: "2026-03-01T09:15:00Z",
      subtotalMinorUnits: 5000000, // ₦50,000.00
      taxMinorUnits: 375000, // ₦3,750.00 (7.5% VAT)
      shippingMinorUnits: 200000, // ₦2,000.00
      discountMinorUnits: 500000, // ₦5,000.00
      totalMinorUnits: 5075000, // ₦50,750.00
      refundMinorUnits: 0,
      tags: ["vip", "furniture"],
      items: [
        {
          id: "item_001",
          orderId: "ord_001",
          productId: "prod_chair",
          productName: "Ergonomic Office Chair",
          sku: "FURN-CHAIR-01",
          category: "Furniture",
          quantity: 2,
          unitPriceMinorUnits: 2500000, // ₦25,000.00
          totalPriceMinorUnits: 5000000,
          unitCostMinorUnits: 1500000, // ₦15,000.00 COGS (₦10,000 profit/unit)
          totalCostMinorUnits: 3000000,
        },
      ],
    },

    // Completed Order 2: Bob buys 1 Standing Desk + 1 Wireless Mouse
    {
      id: "ord_002",
      businessId: "biz_999",
      customerId: "cust_bob",
      customerName: "Bob Eze",
      customerEmail: "bob@example.com",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-02T11:30:00Z",
      completedAt: "2026-03-02T11:45:00Z",
      subtotalMinorUnits: 11000000, // ₦110,000.00
      taxMinorUnits: 825000,
      shippingMinorUnits: 300000,
      discountMinorUnits: 0,
      totalMinorUnits: 12125000, // ₦121,250.00
      refundMinorUnits: 0,
      tags: ["tech"],
      items: [
        {
          id: "item_002",
          orderId: "ord_002",
          productId: "prod_desk",
          productName: "Electric Standing Desk",
          sku: "FURN-DESK-02",
          category: "Furniture",
          quantity: 1,
          unitPriceMinorUnits: 10000000, // ₦100,000.00
          totalPriceMinorUnits: 10000000,
          unitCostMinorUnits: 6500000, // ₦65,000.00 COGS
          totalCostMinorUnits: 6500000,
        },
        {
          id: "item_003",
          orderId: "ord_002",
          productId: "prod_mouse",
          productName: "Wireless Ergonomic Mouse",
          sku: "TECH-MSE-01",
          category: "Electronics",
          quantity: 1,
          unitPriceMinorUnits: 1000000, // ₦10,000.00
          totalPriceMinorUnits: 1000000,
          unitCostMinorUnits: 400000, // ₦4,000.00 COGS
          totalCostMinorUnits: 400000,
        },
      ],
    },

    // Completed Order 3: Alice (Repeat Customer!) buys 1 Wireless Keyboard
    {
      id: "ord_003",
      businessId: "biz_999",
      customerId: "cust_alice",
      customerName: "Alice Adeleke",
      customerEmail: "alice@example.com",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-05T14:10:00Z",
      completedAt: "2026-03-05T14:20:00Z",
      subtotalMinorUnits: 1500000, // ₦15,000.00
      taxMinorUnits: 112500,
      shippingMinorUnits: 150000,
      discountMinorUnits: 0,
      totalMinorUnits: 1762500, // ₦17,625.00
      refundMinorUnits: 0,
      items: [
        {
          id: "item_004",
          orderId: "ord_003",
          productId: "prod_keyboard",
          productName: "Mechanical Bluetooth Keyboard",
          sku: "TECH-KBD-01",
          category: "Electronics",
          quantity: 1,
          unitPriceMinorUnits: 1500000,
          totalPriceMinorUnits: 1500000,
          unitCostMinorUnits: 800000, // ₦8,000.00 COGS
          totalCostMinorUnits: 800000,
        },
      ],
    },

    // Partially Refunded Order 4: Charlie buys 3 Laptop Stands, 1 returned/refunded
    {
      id: "ord_004",
      businessId: "biz_999",
      customerId: "cust_charlie",
      customerName: "Charlie Okafor",
      customerEmail: "charlie@example.com",
      status: "partially_refunded",
      currency: "NGN",
      createdAt: "2026-03-08T16:00:00Z",
      completedAt: "2026-03-08T16:10:00Z",
      subtotalMinorUnits: 6000000, // ₦60,000.00
      taxMinorUnits: 450000,
      shippingMinorUnits: 200000,
      discountMinorUnits: 0,
      totalMinorUnits: 6650000, // ₦66,500.00
      refundMinorUnits: 2000000, // ₦20,000.00 refunded
      items: [
        {
          id: "item_005",
          orderId: "ord_004",
          productId: "prod_stand",
          productName: "Aluminum Laptop Stand",
          sku: "TECH-STND-01",
          category: "Electronics",
          quantity: 3,
          unitPriceMinorUnits: 2000000,
          totalPriceMinorUnits: 6000000,
          unitCostMinorUnits: 1000000,
          totalCostMinorUnits: 3000000,
        },
      ],
    },

    // Cancelled Order 5: David cancelled
    {
      id: "ord_005",
      businessId: "biz_999",
      customerId: "cust_david",
      customerName: "David Mensah",
      customerEmail: "david@example.com",
      status: "cancelled",
      currency: "NGN",
      createdAt: "2026-03-10T10:00:00Z",
      cancelledAt: "2026-03-10T10:05:00Z",
      subtotalMinorUnits: 2500000,
      taxMinorUnits: 187500,
      shippingMinorUnits: 200000,
      discountMinorUnits: 0,
      totalMinorUnits: 2887500,
      refundMinorUnits: 0,
      items: [
        {
          id: "item_006",
          orderId: "ord_005",
          productId: "prod_chair",
          productName: "Ergonomic Office Chair",
          sku: "FURN-CHAIR-01",
          category: "Furniture",
          quantity: 1,
          unitPriceMinorUnits: 2500000,
          totalPriceMinorUnits: 2500000,
        },
      ],
    },

    // Fully Refunded Order 6: Eve returned item
    {
      id: "ord_006",
      businessId: "biz_999",
      customerId: "cust_eve",
      customerName: "Eve Danladi",
      customerEmail: "eve@example.com",
      status: "refunded",
      currency: "NGN",
      createdAt: "2026-03-12T08:00:00Z",
      subtotalMinorUnits: 1000000,
      taxMinorUnits: 75000,
      shippingMinorUnits: 150000,
      discountMinorUnits: 0,
      totalMinorUnits: 1225000,
      refundMinorUnits: 1225000,
      items: [
        {
          id: "item_007",
          orderId: "ord_006",
          productId: "prod_mouse",
          productName: "Wireless Ergonomic Mouse",
          sku: "TECH-MSE-01",
          category: "Electronics",
          quantity: 1,
          unitPriceMinorUnits: 1000000,
          totalPriceMinorUnits: 1000000,
        },
      ],
    },

    // Completed Order 7: Product with missing cost to test incomplete COGS
    {
      id: "ord_007",
      businessId: "biz_999",
      customerId: "cust_femi",
      customerName: "Femi Balogun",
      customerEmail: "femi@example.com",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-15T12:00:00Z",
      completedAt: "2026-03-15T12:10:00Z",
      subtotalMinorUnits: 800000, // ₦8,000.00
      taxMinorUnits: 60000,
      shippingMinorUnits: 100000,
      discountMinorUnits: 0,
      totalMinorUnits: 960000, // ₦9,600.00
      refundMinorUnits: 0,
      items: [
        {
          id: "item_008",
          orderId: "ord_007",
          productId: "prod_cable",
          productName: "USB-C Braided Cable 2M",
          sku: "ACC-CBL-01",
          category: "Accessories",
          quantity: 2,
          unitPriceMinorUnits: 400000,
          totalPriceMinorUnits: 800000,
          // Intentionally omitted unitCostMinorUnits to test incomplete COGS handling
        },
      ],
    },
  ];
}
