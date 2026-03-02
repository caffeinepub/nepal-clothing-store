import type { DiscountCode, OrderStatus, PaymentMethod } from "../backend.d";

/**
 * Format a number as Nepali Rupees (NPR)
 */
export function formatNPR(amount: number): string {
  return new Intl.NumberFormat("ne-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a BigInt timestamp (nanoseconds) to a readable date string.
 */
export function formatDate(timestamp: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

/**
 * Returns Tailwind classes for order status badge colouring.
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    map[status as string] ?? "bg-muted text-muted-foreground border-border"
  );
}

/**
 * Returns a human-readable label for a payment method.
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    esewa: "eSewa",
    khalti: "Khalti",
  };
  return map[method as string] ?? method;
}

/**
 * Calculate discount amount from a DiscountCode and order total.
 * Also accepts explicit value/type for direct usage.
 */
export function calculateDiscount(
  orderTotal: number,
  discount: DiscountCode | null,
): number;
export function calculateDiscount(
  orderTotal: number,
  discountValue: number,
  discountType: "percentage" | "fixed",
): number;
export function calculateDiscount(
  orderTotal: number,
  discountOrValue: DiscountCode | number | null,
  discountType?: "percentage" | "fixed",
): number {
  if (discountOrValue === null) return 0;
  if (typeof discountOrValue === "number") {
    const type = discountType ?? "fixed";
    if (type === "percentage") {
      return Math.round((orderTotal * discountOrValue) / 100);
    }
    return Math.min(discountOrValue, orderTotal);
  }
  // DiscountCode object
  const code = discountOrValue as DiscountCode;
  if (code.discountType === "percentage") {
    return Math.round((orderTotal * code.value) / 100);
  }
  return Math.min(code.value, orderTotal);
}

/**
 * Major cities in Nepal for address forms.
 */
export const NEPAL_CITIES = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bhaktapur",
  "Biratnagar",
  "Birgunj",
  "Butwal",
  "Dharan",
  "Bharatpur",
  "Janakpur",
  "Hetauda",
  "Itahari",
  "Nepalgunj",
  "Dhangadhi",
  "Tulsipur",
  "Ghorahi",
  "Lahan",
  "Damak",
  "Urlabari",
  "Mechinagar",
];
