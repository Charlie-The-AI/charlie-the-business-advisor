import { Order, OrderStatus } from "@charlie-the-ai/advisor-types";

export type ValueAccessor<TSource, TValue> =
  | string // Key path (e.g. "customer.email" or "total_price")
  | ((source: TSource) => TValue);

export interface OrderItemAdapterConfig<TSource = Record<string, unknown>> {
  id: ValueAccessor<TSource, string>;
  productId: ValueAccessor<TSource, string>;
  productName: ValueAccessor<TSource, string>;
  sku?: ValueAccessor<TSource, string | undefined>;
  category?: ValueAccessor<TSource, string | undefined>;
  quantity: ValueAccessor<TSource, number>;
  unitPriceMinorUnits?: ValueAccessor<TSource, number>;
  unitPriceMajorUnits?: ValueAccessor<TSource, number>;
  totalPriceMinorUnits?: ValueAccessor<TSource, number>;
  totalPriceMajorUnits?: ValueAccessor<TSource, number>;
  unitCostMinorUnits?: ValueAccessor<TSource, number | undefined>;
  unitCostMajorUnits?: ValueAccessor<TSource, number | undefined>;
  totalCostMinorUnits?: ValueAccessor<TSource, number | undefined>;
  totalCostMajorUnits?: ValueAccessor<TSource, number | undefined>;
  discountMinorUnits?: ValueAccessor<TSource, number | undefined>;
  discountMajorUnits?: ValueAccessor<TSource, number | undefined>;
  taxMinorUnits?: ValueAccessor<TSource, number | undefined>;
  taxMajorUnits?: ValueAccessor<TSource, number | undefined>;
}

export interface OrderAdapterConfig<TSource = Record<string, unknown>, TItemSource = Record<string, unknown>> {
  id: ValueAccessor<TSource, string>;
  businessId?: ValueAccessor<TSource, string | undefined>;
  customerId?: ValueAccessor<TSource, string | undefined>;
  customerEmail?: ValueAccessor<TSource, string | undefined>;
  customerName?: ValueAccessor<TSource, string | undefined>;
  status: ValueAccessor<TSource, OrderStatus | string>;
  currency: ValueAccessor<TSource, string>;
  createdAt: ValueAccessor<TSource, string | Date>;
  completedAt?: ValueAccessor<TSource, string | Date | undefined>;
  cancelledAt?: ValueAccessor<TSource, string | Date | undefined>;
  subtotalMinorUnits?: ValueAccessor<TSource, number | undefined>;
  subtotalMajorUnits?: ValueAccessor<TSource, number | undefined>;
  taxMinorUnits?: ValueAccessor<TSource, number | undefined>;
  taxMajorUnits?: ValueAccessor<TSource, number | undefined>;
  shippingMinorUnits?: ValueAccessor<TSource, number | undefined>;
  shippingMajorUnits?: ValueAccessor<TSource, number | undefined>;
  discountMinorUnits?: ValueAccessor<TSource, number | undefined>;
  discountMajorUnits?: ValueAccessor<TSource, number | undefined>;
  totalMinorUnits?: ValueAccessor<TSource, number | undefined>;
  totalMajorUnits?: ValueAccessor<TSource, number | undefined>;
  refundMinorUnits?: ValueAccessor<TSource, number | undefined>;
  refundMajorUnits?: ValueAccessor<TSource, number | undefined>;
  tags?: ValueAccessor<TSource, string[] | undefined>;
  items: ValueAccessor<TSource, TItemSource[]>;
  itemConfig?: OrderItemAdapterConfig<TItemSource>;
}

export interface BatchNormalizationResult {
  orders: Order[];
  errors: Array<{ index: number; rawRecord: unknown; issues: string[] }>;
  duplicateCount: number;
  totalProcessed: number;
}
