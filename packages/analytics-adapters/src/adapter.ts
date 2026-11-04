import {
  CharlieOrder,
  CharlieOrderItem,
  CharlieOrderStatus,
  CharlieOrderSchema,
  CharlieOrderItemSchema,
  CharlieCustomer,
  CharlieCustomerSchema,
  Order,
  OrderItem,
  OrderStatus,
  getCurrencyMetadata,
  CurrencyCode,
} from "@charlie-the-ai/advisor-types";
import {
  OrderAdapterConfig,
  DeclarativeOrderMapping,
  LegacyOrderAdapterConfig,
  DeclarativeOrderItemFields,
  CustomerAdapterConfig,
  DeclarativeCustomerMapping,
  ValueAccessor,
  BatchNormalizationResult,
  BatchTransformResult,
} from "./types.js";

/**
 * Creates an order adapter supporting declarative mapping, custom transformation functions,
 * and legacy configurations.
 */
export function createOrderAdapter<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
>(config: OrderAdapterConfig<TSource, TItemSource>) {
  return {
    /**
     * Transforms a raw record into a validated CharlieOrder. Throws on validation error.
     */
    transform(source: TSource): CharlieOrder {
      const res = this.safeTransform(source);
      if (!res.success) {
        throw new Error(`Order transformation failed:\n${res.errors.join("\n")}`);
      }
      return res.data;
    },

    /**
     * Transforms an array of raw records into validated CharlieOrders.
     */
    transformMany(sources: TSource[]): CharlieOrder[] {
      return sources.map((s) => this.transform(s));
    },

    /**
     * Safely transforms a single raw record into a CharlieOrder.
     */
    safeTransform(
      source: TSource
    ): { success: true; data: CharlieOrder } | { success: false; errors: string[] } {
      try {
        // 1. Custom transform function
        if ("transform" in config && typeof config.transform === "function") {
          const transformed = config.transform(source);
          const validated = CharlieOrderSchema.safeParse(transformed);
          if (!validated.success) {
            return {
              success: false,
              errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
            };
          }
          return { success: true, data: validated.data };
        }

        // 2. Declarative mapping ({ fields: { ... } })
        if ("fields" in config) {
          return processDeclarativeOrder(source, config as DeclarativeOrderMapping<TSource, TItemSource>);
        }

        // 3. Legacy flat configuration
        return processLegacyOrderAsCharlie(source, config as LegacyOrderAdapterConfig<TSource, TItemSource>);
      } catch (err: unknown) {
        return {
          success: false,
          errors: [err instanceof Error ? err.message : String(err)],
        };
      }
    },

    /**
     * Safely transforms an array of records with error isolation and deduplication.
     */
    safeTransformMany(
      sources: TSource[],
      options: { strict?: boolean; deduplicate?: boolean } = {}
    ): BatchTransformResult<CharlieOrder> {
      const { strict = false, deduplicate = true } = options;
      const accepted: CharlieOrder[] = [];
      const rejected: Array<{ index: number; rawRecord: unknown; errors: string[] }> = [];
      const seenIds = new Set<string>();
      let duplicateCount = 0;

      for (let i = 0; i < sources.length; i++) {
        const raw = sources[i]!;
        const result = this.safeTransform(raw);

        if (!result.success) {
          rejected.push({ index: i, rawRecord: raw, errors: result.errors });
          if (strict) {
            throw new Error(`Transformation stopped at index ${i}: ${result.errors.join(", ")}`);
          }
          continue;
        }

        if (deduplicate) {
          if (seenIds.has(result.data.id)) {
            duplicateCount++;
            continue;
          }
          seenIds.add(result.data.id);
        }

        accepted.push(result.data);
      }

      return {
        orders: accepted,
        accepted,
        rejected,
        totalProcessed: sources.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
        duplicateCount,
      };
    },

    /**
     * Backwards-compatible normalize method returning legacy Order.
     */
    normalize(source: TSource): { success: true; data: Order } | { success: false; errors: string[] } {
      const res = this.safeTransform(source);
      if (!res.success) {
        return res;
      }

      const o = res.data;
      const legacyItems: OrderItem[] = o.items.map((it, idx) => ({
        id: `item_${idx + 1}`,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPriceMinorUnits: it.unitPriceMinor,
        totalPriceMinorUnits: multiplyMinor(it.unitPriceMinor, it.quantity),
        discountMinorUnits: it.discountMinor || 0,
        sku: it.sku,
        category: it.category || "Uncategorized",
        unitCostMinorUnits: it.unitCostMinor,
      }));

      const legacyOrder: Order = {
        id: o.id,
        customerId: o.customerId || undefined,
        status: o.status as OrderStatus,
        currency: o.currency as CurrencyCode,
        createdAt: o.placedAt,
        subtotalMinorUnits: o.subtotalMinor,
        discountMinorUnits: o.discountMinor,
        taxMinorUnits: o.taxMinor,
        shippingMinorUnits: o.shippingMinor,
        totalMinorUnits: o.totalMinor,
        refundMinorUnits: o.refundedMinor,
        items: legacyItems,
        tags: o.tags,
        metadata: o.metadata,
      };

      return { success: true, data: legacyOrder };
    },

    /**
     * Backwards-compatible normalizeBatch method.
     */
    normalizeBatch(
      sources: TSource[],
      options: { skipInvalid?: boolean; deduplicate?: boolean } = {}
    ): BatchNormalizationResult {
      const batchRes = this.safeTransformMany(sources, {
        strict: options.skipInvalid === false,
        deduplicate: options.deduplicate ?? true,
      });

      const orders: Order[] = batchRes.accepted.map((o) => {
        const legacyItems: OrderItem[] = o.items.map((it, idx) => ({
          id: `item_${idx + 1}`,
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPriceMinorUnits: it.unitPriceMinor,
          totalPriceMinorUnits: multiplyMinor(it.unitPriceMinor, it.quantity),
          discountMinorUnits: it.discountMinor || 0,
          sku: it.sku,
          category: it.category || "Uncategorized",
          unitCostMinorUnits: it.unitCostMinor,
        }));

        return {
          id: o.id,
          customerId: o.customerId || undefined,
          status: o.status as OrderStatus,
          currency: o.currency as CurrencyCode,
          createdAt: o.placedAt,
          subtotalMinorUnits: o.subtotalMinor,
          discountMinorUnits: o.discountMinor,
          taxMinorUnits: o.taxMinor,
          shippingMinorUnits: o.shippingMinor,
          totalMinorUnits: o.totalMinor,
          refundMinorUnits: o.refundedMinor,
          items: legacyItems,
          tags: o.tags,
          metadata: o.metadata,
        };
      });

      const errors = batchRes.rejected.map((r) => ({
        index: r.index,
        rawRecord: r.rawRecord,
        issues: r.errors,
      }));

      return {
        orders,
        errors,
        duplicateCount: batchRes.duplicateCount,
        totalProcessed: batchRes.totalProcessed,
      };
    },
  };
}

/**
 * Creates a customer adapter supporting declarative mapping and custom transformations.
 */
export function createCustomerAdapter<TSource = Record<string, unknown>>(
  config: CustomerAdapterConfig<TSource>
) {
  return {
    transform(source: TSource): CharlieCustomer {
      const res = this.safeTransform(source);
      if (!res.success) {
        throw new Error(`Customer transformation failed:\n${res.errors.join("\n")}`);
      }
      return res.data;
    },

    transformMany(sources: TSource[]): CharlieCustomer[] {
      return sources.map((s) => this.transform(s));
    },

    safeTransform(
      source: TSource
    ): { success: true; data: CharlieCustomer } | { success: false; errors: string[] } {
      try {
        if ("transform" in config && typeof config.transform === "function") {
          const transformed = config.transform(source);
          const validated = CharlieCustomerSchema.safeParse(transformed);
          if (!validated.success) {
            return {
              success: false,
              errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
            };
          }
          return { success: true, data: validated.data };
        }

        const fields = (config as DeclarativeCustomerMapping<TSource>).fields;
        const id = String(resolveAccessor(source, fields.id));
        const rawCreatedAt = fields.createdAt ? resolveAccessor(source, fields.createdAt) : undefined;
        const createdAt = rawCreatedAt ? toIsoString(rawCreatedAt) : undefined;
        const name = fields.name ? toStringOrUndefined(resolveAccessor(source, fields.name)) : undefined;
        const email = fields.email ? toStringOrUndefined(resolveAccessor(source, fields.email)) : undefined;
        const phone = fields.phone ? toStringOrUndefined(resolveAccessor(source, fields.phone)) : undefined;
        const country = fields.country ? toStringOrUndefined(resolveAccessor(source, fields.country)) : undefined;
        const region = fields.region ? toStringOrUndefined(resolveAccessor(source, fields.region)) : undefined;
        const metadata = fields.metadata
          ? (resolveAccessor(source, fields.metadata) as Record<string, unknown>)
          : undefined;

        const customerData: CharlieCustomer = {
          id,
          createdAt,
          name,
          email,
          phone,
          country,
          region,
          metadata,
        };

        const validated = CharlieCustomerSchema.safeParse(customerData);
        if (!validated.success) {
          return {
            success: false,
            errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          };
        }

        return { success: true, data: validated.data };
      } catch (err: unknown) {
        return {
          success: false,
          errors: [err instanceof Error ? err.message : String(err)],
        };
      }
    },

    safeTransformMany(
      sources: TSource[],
      options: { strict?: boolean; deduplicate?: boolean } = {}
    ): BatchTransformResult<CharlieCustomer> {
      const { strict = false, deduplicate = true } = options;
      const accepted: CharlieCustomer[] = [];
      const rejected: Array<{ index: number; rawRecord: unknown; errors: string[] }> = [];
      const seenIds = new Set<string>();
      let duplicateCount = 0;

      for (let i = 0; i < sources.length; i++) {
        const raw = sources[i]!;
        const result = this.safeTransform(raw);

        if (!result.success) {
          rejected.push({ index: i, rawRecord: raw, errors: result.errors });
          if (strict) {
            throw new Error(`Customer transformation stopped at index ${i}: ${result.errors.join(", ")}`);
          }
          continue;
        }

        if (deduplicate) {
          if (seenIds.has(result.data.id)) {
            duplicateCount++;
            continue;
          }
          seenIds.add(result.data.id);
        }

        accepted.push(result.data);
      }

      return {
        orders: accepted,
        accepted,
        rejected,
        totalProcessed: sources.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
        duplicateCount,
      };
    },
  };
}

/**
 * Processes declarative order mapping.
 */
function processDeclarativeOrder<TSource, TItemSource>(
  source: TSource,
  config: DeclarativeOrderMapping<TSource, TItemSource>
): { success: true; data: CharlieOrder } | { success: false; errors: string[] } {
  const f = config.fields;

  const rawCurrency = f.currency ? resolveAccessor(source, f.currency) : config.currency || "NGN";
  const currency = String(rawCurrency).toUpperCase();

  const id = String(resolveAccessor(source, f.id));
  const rawCustomerId = f.customerId ? resolveAccessor(source, f.customerId) : null;
  const customerId = rawCustomerId ? String(rawCustomerId) : null;

  const rawPlacedAt = resolveAccessor(source, f.placedAt);
  const placedAt = toIsoString(rawPlacedAt);

  const rawStatus = resolveAccessor(source, f.status);
  const status = normalizeOrderStatusWithMapping(rawStatus, config.statusMapping);

  // Line items
  const rawItems = f.items ? (resolveAccessor(source, f.items) as TItemSource[]) || [] : [];
  const items: CharlieOrderItem[] = [];

  for (const rawItem of rawItems) {
    const item = normalizeCharlieOrderItem(rawItem, config.itemFields, currency);
    items.push(item);
  }

  // Calculate or resolve monetary fields
  let subtotalMinor = 0;
  if (f.subtotalMinor) {
    subtotalMinor = Math.round(Number(resolveAccessor(source, f.subtotalMinor)) || 0);
  } else if (f.subtotalMajor) {
    subtotalMinor = toMinorUnits(Number(resolveAccessor(source, f.subtotalMajor)) || 0, currency);
  } else if (items.length > 0) {
    subtotalMinor = items.reduce((sum, it) => addMinor(sum, multiplyMinor(it.unitPriceMinor, it.quantity)), 0);
  }

  let discountMinor = config.defaults?.discountMinor ?? 0;
  if (f.discountMinor) {
    discountMinor = Math.round(Number(resolveAccessor(source, f.discountMinor)) || 0);
  } else if (f.discountMajor) {
    discountMinor = toMinorUnits(Number(resolveAccessor(source, f.discountMajor)) || 0, currency);
  }

  let taxMinor = config.defaults?.taxMinor ?? 0;
  if (f.taxMinor) {
    taxMinor = Math.round(Number(resolveAccessor(source, f.taxMinor)) || 0);
  } else if (f.taxMajor) {
    taxMinor = toMinorUnits(Number(resolveAccessor(source, f.taxMajor)) || 0, currency);
  }

  let shippingMinor = config.defaults?.shippingMinor ?? 0;
  if (f.shippingMinor) {
    shippingMinor = Math.round(Number(resolveAccessor(source, f.shippingMinor)) || 0);
  } else if (f.shippingMajor) {
    shippingMinor = toMinorUnits(Number(resolveAccessor(source, f.shippingMajor)) || 0, currency);
  }

  let totalMinor = 0;
  if (f.totalMinor) {
    totalMinor = Math.round(Number(resolveAccessor(source, f.totalMinor)) || 0);
  } else if (f.totalMajor) {
    totalMinor = toMinorUnits(Number(resolveAccessor(source, f.totalMajor)) || 0, currency);
  } else {
    // Reconcile total: subtotal + tax + shipping - discount
    totalMinor = addMinor(subtotalMinor, taxMinor, shippingMinor) - discountMinor;
  }

  let refundedMinor = config.defaults?.refundedMinor ?? 0;
  if (f.refundedMinor) {
    refundedMinor = Math.round(Number(resolveAccessor(source, f.refundedMinor)) || 0);
  } else if (f.refundedMajor) {
    refundedMinor = toMinorUnits(Number(resolveAccessor(source, f.refundedMajor)) || 0, currency);
  }

  const tags = f.tags ? (resolveAccessor(source, f.tags) as string[]) || [] : [];
  const metadata = f.metadata ? (resolveAccessor(source, f.metadata) as Record<string, unknown>) : undefined;

  const orderData: CharlieOrder = {
    id,
    customerId,
    placedAt,
    currency,
    status,
    items,
    subtotalMinor,
    discountMinor,
    taxMinor,
    shippingMinor,
    totalMinor,
    refundedMinor,
    tags,
    metadata,
  };

  const validated = CharlieOrderSchema.safeParse(orderData);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  return { success: true, data: validated.data };
}

/**
 * Normalizes Charlie line items from declarative config.
 */
function normalizeCharlieOrderItem<TItemSource>(
  raw: TItemSource,
  fields: DeclarativeOrderItemFields<TItemSource> | undefined,
  currency: string
): CharlieOrderItem {
  if (!fields) {
    const validated = CharlieOrderItemSchema.safeParse(raw);
    if (validated.success) {
      return validated.data;
    }
    throw new Error(`Invalid item structure: ${validated.error.message}`);
  }

  const productId = String(resolveAccessor(raw, fields.productId));
  const productName = String(resolveAccessor(raw, fields.productName));
  const quantity = Math.max(1, Math.round(Number(resolveAccessor(raw, fields.quantity)) || 1));

  let unitPriceMinor = 0;
  if (fields.unitPriceMinor) {
    unitPriceMinor = Math.round(Number(resolveAccessor(raw, fields.unitPriceMinor)) || 0);
  } else if (fields.unitPriceMajor) {
    unitPriceMinor = toMinorUnits(Number(resolveAccessor(raw, fields.unitPriceMajor)) || 0, currency);
  }

  let discountMinor = 0;
  if (fields.discountMinor) {
    discountMinor = Math.round(Number(resolveAccessor(raw, fields.discountMinor)) || 0);
  } else if (fields.discountMajor) {
    discountMinor = toMinorUnits(Number(resolveAccessor(raw, fields.discountMajor)) || 0, currency);
  }

  const sku = fields.sku ? toStringOrUndefined(resolveAccessor(raw, fields.sku)) : undefined;
  const category = fields.category ? toStringOrUndefined(resolveAccessor(raw, fields.category)) : undefined;

  let unitCostMinor: number | undefined;
  if (fields.unitCostMinor) {
    const val = resolveAccessor(raw, fields.unitCostMinor);
    if (val !== undefined && val !== null) {
      unitCostMinor = Math.round(Number(val));
    }
  } else if (fields.unitCostMajor) {
    const val = resolveAccessor(raw, fields.unitCostMajor);
    if (val !== undefined && val !== null) {
      unitCostMinor = toMinorUnits(Number(val), currency);
    }
  }

  return {
    productId,
    productName,
    quantity,
    unitPriceMinor,
    discountMinor,
    sku,
    category,
    unitCostMinor,
  };
}

/**
 * Processes legacy flat order adapter configs into a CharlieOrder.
 */
function processLegacyOrderAsCharlie<TSource, TItemSource>(
  source: TSource,
  config: LegacyOrderAdapterConfig<TSource, TItemSource>
): { success: true; data: CharlieOrder } | { success: false; errors: string[] } {
  const rawCurrency = resolveAccessor(source, config.currency);
  const currency = String(rawCurrency).toUpperCase();

  const id = String(resolveAccessor(source, config.id));
  const rawCustomerId = config.customerId ? resolveAccessor(source, config.customerId) : null;
  const customerId = rawCustomerId ? String(rawCustomerId) : null;

  const rawCreatedAt = resolveAccessor(source, config.createdAt);
  const placedAt = toIsoString(rawCreatedAt);

  const rawStatus = resolveAccessor(source, config.status);
  const status = normalizeOrderStatus(rawStatus);

  const rawItems = (resolveAccessor(source, config.items) as TItemSource[]) || [];
  const items: CharlieOrderItem[] = [];

  for (const rawItem of rawItems) {
    if (config.itemConfig) {
      const cfg = config.itemConfig;
      const productId = String(resolveAccessor(rawItem, cfg.productId));
      const productName = String(resolveAccessor(rawItem, cfg.productName));
      const quantity = Math.max(1, Math.round(Number(resolveAccessor(rawItem, cfg.quantity)) || 1));

      let unitPriceMinor = 0;
      if (cfg.unitPriceMinorUnits) {
        unitPriceMinor = Math.round(Number(resolveAccessor(rawItem, cfg.unitPriceMinorUnits)) || 0);
      } else if (cfg.unitPriceMajorUnits) {
        unitPriceMinor = toMinorUnits(Number(resolveAccessor(rawItem, cfg.unitPriceMajorUnits)) || 0, currency);
      }

      items.push({
        productId,
        productName,
        quantity,
        unitPriceMinor,
        discountMinor: 0,
        sku: cfg.sku ? toStringOrUndefined(resolveAccessor(rawItem, cfg.sku)) : undefined,
        category: cfg.category ? toStringOrUndefined(resolveAccessor(rawItem, cfg.category)) : undefined,
      });
    }
  }

  let subtotalMinor = 0;
  if (config.subtotalMinorUnits) {
    subtotalMinor = Math.round(Number(resolveAccessor(source, config.subtotalMinorUnits)) || 0);
  } else if (config.subtotalMajorUnits) {
    subtotalMinor = toMinorUnits(Number(resolveAccessor(source, config.subtotalMajorUnits)) || 0, currency);
  }

  let discountMinor = 0;
  if (config.discountMinorUnits) {
    discountMinor = Math.round(Number(resolveAccessor(source, config.discountMinorUnits)) || 0);
  } else if (config.discountMajorUnits) {
    discountMinor = toMinorUnits(Number(resolveAccessor(source, config.discountMajorUnits)) || 0, currency);
  }

  let taxMinor = 0;
  if (config.taxMinorUnits) {
    taxMinor = Math.round(Number(resolveAccessor(source, config.taxMinorUnits)) || 0);
  } else if (config.taxMajorUnits) {
    taxMinor = toMinorUnits(Number(resolveAccessor(source, config.taxMajorUnits)) || 0, currency);
  }

  let shippingMinor = 0;
  if (config.shippingMinorUnits) {
    shippingMinor = Math.round(Number(resolveAccessor(source, config.shippingMinorUnits)) || 0);
  } else if (config.shippingMajorUnits) {
    shippingMinor = toMinorUnits(Number(resolveAccessor(source, config.shippingMajorUnits)) || 0, currency);
  }

  let totalMinor = 0;
  if (config.totalMinorUnits) {
    totalMinor = Math.round(Number(resolveAccessor(source, config.totalMinorUnits)) || 0);
  } else if (config.totalMajorUnits) {
    totalMinor = toMinorUnits(Number(resolveAccessor(source, config.totalMajorUnits)) || 0, currency);
  } else {
    totalMinor = addMinor(subtotalMinor, taxMinor, shippingMinor) - discountMinor;
  }

  let refundedMinor = 0;
  if (config.refundMinorUnits) {
    refundedMinor = Math.round(Number(resolveAccessor(source, config.refundMinorUnits)) || 0);
  } else if (config.refundMajorUnits) {
    refundedMinor = toMinorUnits(Number(resolveAccessor(source, config.refundMajorUnits)) || 0, currency);
  }

  const tags = config.tags ? (resolveAccessor(source, config.tags) as string[]) || [] : [];

  const charlieOrder: CharlieOrder = {
    id,
    customerId,
    placedAt,
    currency,
    status: (status === "failed" ? "cancelled" : status) as CharlieOrderStatus,
    items,
    subtotalMinor,
    discountMinor,
    taxMinor,
    shippingMinor,
    totalMinor,
    refundedMinor,
    tags,
  };

  const validated = CharlieOrderSchema.safeParse(charlieOrder);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  return { success: true, data: validated.data };
}

/**
 * Resolves a value accessor (either dot-notated string path or callback function).
 */
export function resolveAccessor<TSource, TValue>(
  source: TSource,
  accessor: ValueAccessor<TSource, TValue>
): unknown {
  if (typeof accessor === "function") {
    return accessor(source);
  }

  if (typeof accessor === "string") {
    const parts = accessor.split(".");
    let current: unknown = source;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  return undefined;
}

/**
 * Maps external status strings to standard CharlieOrderStatus with optional custom mapping.
 */
export function normalizeOrderStatusWithMapping(
  raw: unknown,
  customMapping?: Record<string, CharlieOrderStatus>
): CharlieOrderStatus {
  const str = String(raw).toLowerCase().trim();

  if (customMapping && customMapping[str]) {
    return customMapping[str]!;
  }

  switch (str) {
    case "completed":
    case "complete":
    case "paid":
    case "successful":
    case "delivered":
    case "fulfilled":
    case "success":
      return "completed";

    case "partially_refunded":
    case "partial_refund":
      return "partially_refunded";

    case "refunded":
    case "refund":
    case "reversed":
      return "refunded";

    case "cancelled":
    case "canceled":
    case "void":
    case "voided":
    case "failed":
    case "declined":
    case "error":
      return "cancelled";

    case "pending":
    case "processing":
    case "open":
    case "unpaid":
    default:
      return "pending";
  }
}

export function normalizeOrderStatus(raw: unknown): OrderStatus {
  return normalizeOrderStatusWithMapping(raw) as OrderStatus;
}

export function toIsoString(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "number") {
    return new Date(val).toISOString();
  }
  const str = String(val);
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: "${str}"`);
  }
  return date.toISOString();
}

export function toStringOrUndefined(val: unknown): string | undefined {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  return String(val);
}

function toMinorUnits(majorUnits: number, currency: string): number {
  try {
    const meta = getCurrencyMetadata(currency as CurrencyCode);
    const factor = Math.pow(10, meta.minorUnitDecimals);
    return Math.round(majorUnits * factor);
  } catch {
    return Math.round(majorUnits * 100);
  }
}

function addMinor(...amounts: number[]): number {
  return amounts.reduce((acc, curr) => Math.round(acc) + Math.round(curr), 0);
}

function multiplyMinor(minor: number, factor: number): number {
  return Math.round(Math.round(minor) * factor);
}
