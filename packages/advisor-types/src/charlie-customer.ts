import { z } from "zod";
import type { Customer } from "./customer.js";

/**
 * Canonical CharlieCustomer contract.
 * Represents customer profiles for customer retention, RFM segmentation, and lifetime diagnostics.
 */
export const CharlieCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID must not be empty"),
  createdAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "createdAt must be a valid ISO 8601 date string",
    })
    .optional(),
  name: z.string().optional(),
  email: z
    .string()
    .email("Invalid customer email address")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CharlieCustomer = z.infer<typeof CharlieCustomerSchema>;

/**
 * Bi-directional converter between legacy Customer and canonical CharlieCustomer.
 */
export function toCharlieCustomer(customer: Customer | CharlieCustomer): CharlieCustomer {
  if ("country" in customer || "region" in customer) {
    return CharlieCustomerSchema.parse(customer);
  }

  const legacy = customer as Customer;
  return CharlieCustomerSchema.parse({
    id: legacy.id,
    createdAt: legacy.createdAt,
    name: legacy.name,
    email: legacy.email,
    phone: legacy.phone,
    metadata: legacy.metadata,
  });
}
