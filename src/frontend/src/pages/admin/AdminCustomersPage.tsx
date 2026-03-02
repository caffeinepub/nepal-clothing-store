import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllOrders } from "@/hooks/useQueries";
import { formatDate, formatNPR } from "@/lib/helpers";
import { MapPin, Phone, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

interface CustomerRow {
  name: string;
  phone: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: bigint;
}

export function AdminCustomersPage() {
  const { data: orders, isLoading } = useAllOrders();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"orders" | "spent">("orders");

  const customers = useMemo<CustomerRow[]>(() => {
    if (!orders) return [];

    const map = new Map<string, CustomerRow>();

    for (const order of orders) {
      const phone = order.customerInfo.phone;
      const existing = map.get(phone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.totalAmount;
        if (order.createdAt > existing.lastOrderAt) {
          existing.lastOrderAt = order.createdAt;
          existing.name = order.customerInfo.name;
          existing.city = order.customerInfo.city;
        }
      } else {
        map.set(phone, {
          name: order.customerInfo.name,
          phone,
          city: order.customerInfo.city,
          orderCount: 1,
          totalSpent: order.totalAmount,
          lastOrderAt: order.createdAt,
        });
      }
    }

    return Array.from(map.values());
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q),
    );

    return result.sort((a, b) =>
      sortBy === "orders"
        ? b.orderCount - a.orderCount
        : b.totalSpent - a.totalSpent,
    );
  }, [customers, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">
            Customers
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading ? (
              <Skeleton className="h-4 w-28 inline-block" />
            ) : (
              `${customers.length} unique customer${customers.length !== 1 ? "s" : ""}`
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "orders" | "spent")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orders">Most Orders</SelectItem>
            <SelectItem value="spent">Most Spent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-admin-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {/* Fake table header */}
            <div className="px-5 py-3 bg-muted/40 flex gap-6">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex gap-6 items-center">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[130px]">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[110px]">
                    City
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[80px] text-right">
                    Orders
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px] text-right">
                    Total Spent
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[130px]">
                    Last Order
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.phone}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Avatar initials */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary leading-none">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {customer.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="font-mono">{customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span>{customer.city}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/20 text-xs font-bold text-accent-foreground">
                        {customer.orderCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-heading font-bold text-primary">
                        {formatNPR(customer.totalSpent)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(customer.lastOrderAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Polished empty state */
          <div className="py-16 px-6 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
                <Users className="w-10 h-10 text-muted-foreground/40" />
              </div>
              {/* Small decorative dots */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-accent/30" />
            </div>
            <div className="max-w-xs">
              <p className="text-base font-heading font-semibold text-foreground">
                {search ? "No customers found" : "No customers yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {search
                  ? `No results for "${search}" — try a different name, phone, or city`
                  : "Customer profiles are built automatically from orders. Your first sale will appear here."}
              </p>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
