import {
  CharlieOrder,
  CharlieOrderStatus,
  CharlieCustomer,
  Order,
  OrderStatus,
} from "@charlie-the-ai/advisor-types";

export type ValueAccessor<TSource, TValue> =
  | string // Dot-separated key path (e.g. "customer.email" or "total_price")
  | ((source: TSource) => TValue);

/**
 * Line item configuration for declarative order adapters.
 */
export interface DeclarativeOrderItemFields<TItemSource = Record<string, unknown>> {
  productId: ValueAccessor<TItemSource, string>;
  productName: ValueAccessor<TItemSource, string>;
  quantity: ValueAccessor<TItemSource, number>;
  unitPriceMinor?: ValueAccessor<TItemSource, number>;
  unitPriceMajor?: ValueAccessor<TItemSource, number>;
  discountMinor?: ValueAccessor<TItemSource, number | undefined>;
  discountMajor?: ValueAccessor<TItemSource, number | undefined>;
  sku?: ValueAccessor<TItemSource, string | undefined>;
  category?: ValueAccessor<TItemSource, string | undefined>;
  unitCostMinor?: ValueAccessor<TItemSource, number | undefined>;
  unitCostMajor?: ValueAccessor<TItemSource, number | undefined>;
}

/**
 * Declarative field mapping for CharlieOrder.
 */
export interface DeclarativeOrderFields<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
> {
  id: ValueAccessor<TSource, string>;
  customerId?: ValueAccessor<TSource, string | null | undefined>;
  placedAt: ValueAccessor<TSource, string | Date | number>;
  currency?: ValueAccessor<TSource, string>;
  status: ValueAccessor<TSource, CharlieOrderStatus | string>;
  items?: ValueAccessor<TSource, TItemSource[]>;
  subtotalMinor?: ValueAccessor<TSource, number | undefined>;
  subtotalMajor?: ValueAccessor<TSource, number | undefined>;
  discountMinor?: ValueAccessor<TSource, number | undefined>;
  discountMajor?: ValueAccessor<TSource, number | undefined>;
  taxMinor?: ValueAccessor<TSource, number | undefined>;
  taxMajor?: ValueAccessor<TSource, number | undefined>;
  shippingMinor?: ValueAccessor<TSource, number | undefined>;
  shippingMajor?: ValueAccessor<TSource, number | undefined>;
  totalMinor?: ValueAccessor<TSource, number | undefined>;
  totalMajor?: ValueAccessor<TSource, number | undefined>;
  refundedMinor?: ValueAccessor<TSource, number | undefined>;
  refundedMajor?: ValueAccessor<TSource, number | undefined>;
  tags?: ValueAccessor<TSource, string[] | undefined>;
  metadata?: ValueAccessor<TSource, Record<string, unknown> | undefined>;
}

export interface DeclarativeOrderMapping<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
> {
  fields: DeclarativeOrderFields<TSource, TItemSource>;
  itemFields?: DeclarativeOrderItemFields<TItemSource>;
  currency?: string; // Default fallback currency
  statusMapping?: Record<string, CharlieOrderStatus>;
  defaults?: {
    discountMinor?: number;
    taxMinor?: number;
    shippingMinor?: number;
    refundedMinor?: number;
  };
}

export interface CustomOrderTransformConfig<TSource> {
  transform: (source: TSource) => CharlieOrder;
}

/**
 * Legacy flat config for backwards compatibility.
 */
export interface LegacyOrderAdapterConfig<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
> {
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

export type OrderAdapterConfig<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
> =
  | DeclarativeOrderMapping<TSource, TItemSource>
  | CustomOrderTransformConfig<TSource>
  | LegacyOrderAdapterConfig<TSource, TItemSource>;

/**
 * Customer Adapter configurations
 */
export interface DeclarativeCustomerFields<TSource = Record<string, unknown>> {
  id: ValueAccessor<TSource, string>;
  createdAt?: ValueAccessor<TSource, string | Date | number | undefined>;
  name?: ValueAccessor<TSource, string | undefined>;
  email?: ValueAccessor<TSource, string | undefined>;
  phone?: ValueAccessor<TSource, string | undefined>;
  country?: ValueAccessor<TSource, string | undefined>;
  region?: ValueAccessor<TSource, string | undefined>;
  metadata?: ValueAccessor<TSource, Record<string, unknown> | undefined>;
}

export interface DeclarativeCustomerMapping<TSource = Record<string, unknown>> {
  fields: DeclarativeCustomerFields<TSource>;
}

export interface CustomCustomerTransformConfig<TSource> {
  transform: (source: TSource) => CharlieCustomer;
}

export type CustomerAdapterConfig<TSource = Record<string, unknown>> =
  | DeclarativeCustomerMapping<TSource>
  | CustomCustomerTransformConfig<TSource>;

/**
 * Normalization / Transformation results
 */
export interface BatchNormalizationResult {
  orders: Order[];
  errors: Array<{ index: number; rawRecord: unknown; issues: string[] }>;
  duplicateCount: number;
  totalProcessed: number;
}

export interface BatchTransformResult<T> {
  orders: T[];
  accepted: T[];
  rejected: Array<{ index: number; rawRecord: unknown; errors: string[] }>;
  totalProcessed: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
}
