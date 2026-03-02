import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleString("en-GB");
}

export const NEPAL_CITIES = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bhaktapur",
  "Biratnagar",
  "Birgunj",
  "Butwal",
  "Dharan",
  "Hetauda",
  "Nepalgunj",
  "Janakpur",
  "Itahari",
  "Bharatpur",
  "Damak",
  "Ghorahi",
  "Tulsipur",
  "Lahan",
  "Rajbiraj",
  "Mahendranagar",
  "Siddharthanagar",
];

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}

export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    esewa: "eSewa",
    khalti: "Khalti",
  };
  return map[method] ?? method;
}

export function calculateDiscount(
  subtotal: number,
  discountCode: {
    discountType: string;
    value: number;
    minOrderAmount?: number;
  } | null,
): number {
  if (!discountCode) return 0;
  if (discountCode.minOrderAmount && subtotal < discountCode.minOrderAmount)
    return 0;
  if (discountCode.discountType === "percentage") {
    return Math.round((subtotal * discountCode.value) / 100);
  }
  return Math.min(discountCode.value, subtotal);
}
