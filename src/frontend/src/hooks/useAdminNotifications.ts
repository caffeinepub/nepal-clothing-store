import { useEffect, useState } from "react";
import type { Order } from "../backend.d";
import { useAllOrders } from "./useQueries";

const LAST_SEEN_TIMESTAMP_KEY = "lastSeenOrderTimestamp";

function getLastSeenTimestamp(): number {
  const stored = localStorage.getItem(LAST_SEEN_TIMESTAMP_KEY);
  if (!stored) return 0;
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function useAdminNotifications(): {
  newOrdersCount: number;
  newOrders: Order[];
  markAllSeen: () => void;
  isLoading: boolean;
} {
  const { data: orders, isLoading } = useAllOrders({ refetchInterval: 30000 });
  const [lastSeenTs, setLastSeenTs] = useState<number>(getLastSeenTimestamp);

  // Listen for same-tab updates to the last-seen timestamp
  useEffect(() => {
    const handler = () => {
      setLastSeenTs(getLastSeenTimestamp());
    };
    window.addEventListener("adminNotificationsUpdated", handler);
    return () => {
      window.removeEventListener("adminNotificationsUpdated", handler);
    };
  }, []);

  // An order is "new" if its createdAt (nanoseconds bigint) > lastSeenTs (ms) * 1_000_000
  const newOrders: Order[] = (orders ?? []).filter((order) => {
    const createdAtMs = Number(order.createdAt / BigInt(1_000_000));
    return createdAtMs > lastSeenTs;
  });

  const markAllSeen = () => {
    const now = Date.now();
    localStorage.setItem(LAST_SEEN_TIMESTAMP_KEY, now.toString());
    setLastSeenTs(now);
    window.dispatchEvent(new Event("adminNotificationsUpdated"));
  };

  return {
    newOrdersCount: newOrders.length,
    newOrders,
    markAllSeen,
    isLoading,
  };
}
