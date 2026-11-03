import { z } from "zod";
import { CurrencyCodeSchema } from "./currency.js";

export const ProductSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  category: z.string().default("Uncategorized"),
  unitPriceMinorUnits: z.number().int().nonnegative(),
  unitCostMinorUnits: z.number().int().nonnegative().optional(), // Nullable if COGS untracked
  currency: CurrencyCodeSchema,
  status: z.enum(["active", "archived", "draft"]).default("active"),
  inventoryCount: z.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
