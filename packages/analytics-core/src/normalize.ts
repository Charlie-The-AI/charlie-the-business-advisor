import {
  CharlieOrder,
  CharlieCustomer,
  Order,
  Customer,
  toCharlieOrder,
  toCharlieCustomer,
} from "@charlie-the-ai/advisor-types";

/**
 * Ensures an order input conforms to the canonical CharlieOrder contract.
 */
export function ensureCharlieOrder(order: Order | CharlieOrder): CharlieOrder {
  if ("subtotalMinor" in order && "placedAt" in order) {
    return order as CharlieOrder;
  }
  return toCharlieOrder(order);
}

/**
 * Ensures an array of orders conforms to canonical CharlieOrders.
 */
export function ensureCharlieOrders(orders: (Order | CharlieOrder)[]): CharlieOrder[] {
  return orders.map(ensureCharlieOrder);
}

/**
 * Ensures a customer input conforms to the canonical CharlieCustomer contract.
 */
export function ensureCharlieCustomer(customer: Customer | CharlieCustomer): CharlieCustomer {
  if ("country" in customer || "region" in customer) {
    return customer as CharlieCustomer;
  }
  return toCharlieCustomer(customer);
}

/**
 * Ensures an array of customers conforms to canonical CharlieCustomers.
 */
export function ensureCharlieCustomers(customers?: (Customer | CharlieCustomer)[]): CharlieCustomer[] {
  if (!customers) return [];
  return customers.map(ensureCharlieCustomer);
}
