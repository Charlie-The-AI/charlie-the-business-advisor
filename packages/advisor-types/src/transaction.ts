import { z } from "zod";
import { CurrencyCodeSchema } from "./currency.js";

export const TransactionTypeSchema = z.enum(["payment", "refund", "payout", "fee"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum(["successful", "failed", "pending"]);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  businessId: z.string().optional(),
  amountMinorUnits: z.number().int().nonnegative(),
  currency: CurrencyCodeSchema,
  type: TransactionTypeSchema,
  status: TransactionStatusSchema,
  paymentGateway: z.string().optional(), // e.g. "paystack", "flutterwave", "stripe"
  gatewayReference: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  metadata: z.record(z.unknown()).optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
