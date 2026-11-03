import {
  Order,
  OrderItem,
  OrderStatus,
  OrderSchema,
  OrderItemSchema,
} from "@charlie/advisor-types";
import { Money } from "@charlie/analytics-core";
import {
  OrderAdapterConfig,
  OrderItemAdapterConfig,
  ValueAccessor,
  BatchNormalizationResult,
} from "./types.js";

/**
 * Creates a reusable data adapter that transforms external order structures into Charlie's standardized contracts.
 */
export function createOrderAdapter<
  TSource = Record<string, unknown>,
  TItemSource = Record<string, unknown>,
>(config: OrderAdapterConfig<TSource, TItemSource>) {
  return {
    /**
     * Normalizes a single raw record.
     */
    normalize(source: TSource): { success: true; data: Order } | { success: false; errors: string[] } {
      try {
        const rawCurrency = resolveAccessor(source, config.currency);
        const currency = String(rawCurrency).toUpperCase();

        const rawCreatedAt = resolveAccessor(source, config.createdAt);
        const createdAt = toIsoString(rawCreatedAt);

        const rawCompletedAt = config.completedAt
          ? resolveAccessor(source, config.completedAt)
          : undefined;
        const completedAt = rawCompletedAt ? toIsoString(rawCompletedAt) : undefined;

        const rawCancelledAt = config.cancelledAt
          ? resolveAccessor(source, config.cancelledAt)
          : undefined;
        const cancelledAt = rawCancelledAt ? toIsoString(rawCancelledAt) : undefined;

        const rawStatus = resolveAccessor(source, config.status);
        const status = normalizeOrderStatus(rawStatus);

        // Normalize Line Items
        const rawItems = (resolveAccessor(source, config.items) as TItemSource[]) || [];
        const items: OrderItem[] = [];

        for (const rawItem of rawItems) {
          const item = normalizeOrderItem(rawItem, config.itemConfig, currency);
          items.push(item);
        }

        // Compute or resolve monetary values
        let subtotalMinorUnits = 0;
        if (config.subtotalMinorUnits) {
          subtotalMinorUnits = Math.round(Number(resolveAccessor(source, config.subtotalMinorUnits)) || 0);
        } else if (config.subtotalMajorUnits) {
          subtotalMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.subtotalMajorUnits)) || 0,
            currency
          );
        } else {
          // Sum up items total
          subtotalMinorUnits = items.reduce((sum, it) => Money.add(sum, it.totalPriceMinorUnits), 0);
        }

        let taxMinorUnits = 0;
        if (config.taxMinorUnits) {
          taxMinorUnits = Math.round(Number(resolveAccessor(source, config.taxMinorUnits)) || 0);
        } else if (config.taxMajorUnits) {
          taxMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.taxMajorUnits)) || 0,
            currency
          );
        }

        let shippingMinorUnits = 0;
        if (config.shippingMinorUnits) {
          shippingMinorUnits = Math.round(Number(resolveAccessor(source, config.shippingMinorUnits)) || 0);
        } else if (config.shippingMajorUnits) {
          shippingMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.shippingMajorUnits)) || 0,
            currency
          );
        }

        let discountMinorUnits = 0;
        if (config.discountMinorUnits) {
          discountMinorUnits = Math.round(Number(resolveAccessor(source, config.discountMinorUnits)) || 0);
        } else if (config.discountMajorUnits) {
          discountMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.discountMajorUnits)) || 0,
            currency
          );
        }

        let totalMinorUnits = 0;
        if (config.totalMinorUnits) {
          totalMinorUnits = Math.round(Number(resolveAccessor(source, config.totalMinorUnits)) || 0);
        } else if (config.totalMajorUnits) {
          totalMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.totalMajorUnits)) || 0,
            currency
          );
        } else {
          totalMinorUnits = Money.subtract(
            Money.add(subtotalMinorUnits, taxMinorUnits, shippingMinorUnits),
            discountMinorUnits
          );
        }

        let refundMinorUnits = 0;
        if (config.refundMinorUnits) {
          refundMinorUnits = Math.round(Number(resolveAccessor(source, config.refundMinorUnits)) || 0);
        } else if (config.refundMajorUnits) {
          refundMinorUnits = Money.toMinorUnits(
            Number(resolveAccessor(source, config.refundMajorUnits)) || 0,
            currency
          );
        }

        const orderData = {
          id: String(resolveAccessor(source, config.id)),
          businessId: config.businessId ? toStringOrUndefined(resolveAccessor(source, config.businessId)) : undefined,
          customerId: config.customerId ? toStringOrUndefined(resolveAccessor(source, config.customerId)) : undefined,
          customerEmail: config.customerEmail ? toStringOrUndefined(resolveAccessor(source, config.customerEmail)) : undefined,
          customerName: config.customerName ? toStringOrUndefined(resolveAccessor(source, config.customerName)) : undefined,
          status,
          currency,
          createdAt,
          completedAt,
          cancelledAt,
          subtotalMinorUnits,
          taxMinorUnits,
          shippingMinorUnits,
          discountMinorUnits,
          totalMinorUnits,
          refundMinorUnits,
          items,
          tags: config.tags ? (resolveAccessor(source, config.tags) as string[]) || [] : [],
        };

        const validated = OrderSchema.safeParse(orderData);
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

    /**
     * Batch normalizes an array of raw records with deduplication and error isolation.
     */
    normalizeBatch(
      sources: TSource[],
      options: { skipInvalid?: boolean; deduplicate?: boolean } = {}
    ): BatchNormalizationResult {
      const { skipInvalid = true, deduplicate = true } = options;
      const orders: Order[] = [];
      const errors: Array<{ index: number; rawRecord: unknown; issues: string[] }> = [];
      const seenIds = new Set<string>();
      let duplicateCount = 0;

      for (let i = 0; i < sources.length; i++) {
        const raw = sources[i]!;
        const result = this.normalize(raw);

        if (!result.success) {
          errors.push({ index: i, rawRecord: raw, issues: result.errors });
          if (!skipInvalid) {
            break;
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

        orders.push(result.data);
      }

      return {
        orders,
        errors,
        duplicateCount,
        totalProcessed: sources.length,
      };
    },
  };
}

/**
 * Normalizes an individual line item.
 */
function normalizeOrderItem<TItemSource>(
  raw: TItemSource,
  config: OrderItemAdapterConfig<TItemSource> | undefined,
  currency: string
): OrderItem {
  if (!config) {
    // If no config provided, assume raw is compatible with OrderItemSchema
    const validated = OrderItemSchema.safeParse(raw);
    if (validated.success) {
      return validated.data;
    }
    throw new Error(`Invalid item structure: ${validated.error.message}`);
  }

  const id = String(resolveAccessor(raw, config.id));
  const productId = String(resolveAccessor(raw, config.productId));
  const productName = String(resolveAccessor(raw, config.productName));
  const sku = config.sku ? toStringOrUndefined(resolveAccessor(raw, config.sku)) : undefined;
  const category = config.category
    ? toStringOrUndefined(resolveAccessor(raw, config.category)) || "Uncategorized"
    : "Uncategorized";
  const quantity = Math.max(1, Math.round(Number(resolveAccessor(raw, config.quantity)) || 1));

  let unitPriceMinorUnits = 0;
  if (config.unitPriceMinorUnits) {
    unitPriceMinorUnits = Math.round(Number(resolveAccessor(raw, config.unitPriceMinorUnits)) || 0);
  } else if (config.unitPriceMajorUnits) {
    unitPriceMinorUnits = Money.toMinorUnits(
      Number(resolveAccessor(raw, config.unitPriceMajorUnits)) || 0,
      currency
    );
  }

  let totalPriceMinorUnits = 0;
  if (config.totalPriceMinorUnits) {
    totalPriceMinorUnits = Math.round(Number(resolveAccessor(raw, config.totalPriceMinorUnits)) || 0);
  } else if (config.totalPriceMajorUnits) {
    totalPriceMinorUnits = Money.toMinorUnits(
      Number(resolveAccessor(raw, config.totalPriceMajorUnits)) || 0,
      currency
    );
  } else {
    totalPriceMinorUnits = Money.multiply(unitPriceMinorUnits, quantity);
  }

  let unitCostMinorUnits: number | undefined;
  if (config.unitCostMinorUnits) {
    const rawCost = resolveAccessor(raw, config.unitCostMinorUnits);
    if (rawCost !== undefined && rawCost !== null) {
      unitCostMinorUnits = Math.round(Number(rawCost));
    }
  } else if (config.unitCostMajorUnits) {
    const rawCost = resolveAccessor(raw, config.unitCostMajorUnits);
    if (rawCost !== undefined && rawCost !== null) {
      unitCostMinorUnits = Money.toMinorUnits(Number(rawCost), currency);
    }
  }

  let totalCostMinorUnits: number | undefined;
  if (config.totalCostMinorUnits) {
    const rawCost = resolveAccessor(raw, config.totalCostMinorUnits);
    if (rawCost !== undefined && rawCost !== null) {
      totalCostMinorUnits = Math.round(Number(rawCost));
    }
  } else if (config.totalCostMajorUnits) {
    const rawCost = resolveAccessor(raw, config.totalCostMajorUnits);
    if (rawCost !== undefined && rawCost !== null) {
      totalCostMinorUnits = Money.toMinorUnits(Number(rawCost), currency);
    }
  } else if (unitCostMinorUnits !== undefined) {
    totalCostMinorUnits = Money.multiply(unitCostMinorUnits, quantity);
  }

  return {
    id,
    productId,
    productName,
    sku,
    category,
    quantity,
    unitPriceMinorUnits,
    totalPriceMinorUnits,
    unitCostMinorUnits,
    totalCostMinorUnits,
    discountMinorUnits: 0,
    taxMinorUnits: 0,
  };
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
 * Maps common external status strings to standard OrderStatus.
 */
export function normalizeOrderStatus(raw: unknown): OrderStatus {
  const str = String(raw).toLowerCase().trim();
  switch (str) {
    case "completed":
    case "complete":
    case "paid":
    case "successful":
    case "delivered":
    case "fulfilled":
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
      return "cancelled";

    case "failed":
    case "declined":
    case "error":
      return "failed";

    case "pending":
    case "processing":
    case "open":
    case "unpaid":
    default:
      return "pending";
  }
}

function toIsoString(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  const str = String(val);
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: "${str}"`);
  }
  return date.toISOString();
}

function toStringOrUndefined(val: unknown): string | undefined {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  return String(val);
}
