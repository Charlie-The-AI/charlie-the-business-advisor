import { createOrderAdapter } from "../adapter.js";

export interface LaravelOrderItemRecord {
  id: number | string;
  order_id: number | string;
  product_id: number | string;
  product_name?: string;
  name?: string;
  sku?: string;
  category?: string;
  quantity: number;
  price: number; // Major units (e.g. 2500.00)
  cost_price?: number;
}

export interface LaravelOrderRecord {
  id: number | string;
  vendor_id?: number | string;
  user_id?: number | string;
  customer?: {
    id?: number | string;
    email?: string;
    name?: string;
  };
  status: string; // "paid", "completed", "cancelled", etc.
  currency?: string; // Default "NGN"
  total_amount: number; // Major units (e.g. 50000.00)
  tax_amount?: number;
  shipping_fee?: number;
  discount_amount?: number;
  refund_amount?: number;
  created_at: string;
  updated_at?: string;
  order_items: LaravelOrderItemRecord[];
}

/**
 * Pre-configured adapter for Laravel Eloquent vendor order schemas.
 */
export function createLaravelOrderAdapter(defaultCurrency: string = "NGN") {
  return createOrderAdapter<LaravelOrderRecord, LaravelOrderItemRecord>({
    id: (o) => String(o.id),
    businessId: (o) => (o.vendor_id ? `vendor_${o.vendor_id}` : undefined),
    customerId: (o) => (o.customer?.id ? String(o.customer.id) : o.user_id ? String(o.user_id) : undefined),
    customerEmail: (o) => o.customer?.email,
    customerName: (o) => o.customer?.name,
    status: (o) => o.status,
    currency: (o) => o.currency || defaultCurrency,
    createdAt: (o) => o.created_at,
    totalMajorUnits: (o) => o.total_amount,
    taxMajorUnits: (o) => o.tax_amount ?? 0,
    shippingMajorUnits: (o) => o.shipping_fee ?? 0,
    discountMajorUnits: (o) => o.discount_amount ?? 0,
    refundMajorUnits: (o) => o.refund_amount ?? 0,
    items: (o) => o.order_items || [],
    itemConfig: {
      id: (i) => String(i.id),
      productId: (i) => String(i.product_id),
      productName: (i) => i.product_name || i.name || `Product ${i.product_id}`,
      sku: (i) => i.sku,
      category: (i) => i.category || "General",
      quantity: (i) => Number(i.quantity) || 1,
      unitPriceMajorUnits: (i) => Number(i.price) || 0,
      unitCostMajorUnits: (i) => (i.cost_price !== undefined ? Number(i.cost_price) : undefined),
    },
  });
}
