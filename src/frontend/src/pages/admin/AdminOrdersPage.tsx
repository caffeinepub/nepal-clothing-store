import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OrderStatus,
  useAllOrders,
  useUpdateOrderStatus,
} from "@/hooks/useQueries";
import {
  formatDate,
  formatNPR,
  getOrderStatusColor,
  getPaymentMethodLabel,
} from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../../backend.d";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.processing, label: "Processing" },
  { value: OrderStatus.shipped, label: "Shipped" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

export function AdminOrdersPage() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders?.filter((o) => {
    const matchesSearch =
      !search ||
      o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search);
    const matchesStatus =
      statusFilter === "all" || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: orderId,
        status: status as OrderStatus,
      });
      toast.success("Order status updated");
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((o) =>
          o ? { ...o, orderStatus: status as Order["orderStatus"] } : null,
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Orders
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {filtered?.length ?? 0} orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow
                    key={order.id.toString()}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-mono text-xs">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {order.customerInfo.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerInfo.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {formatNPR(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border capitalize ${getOrderStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={order.orderStatus}
                        onValueChange={(v) =>
                          void handleStatusChange(order.id, v)
                        }
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.slice(1).map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center justify-between">
                  <span>Order #{selectedOrder.id.toString()}</span>
                  <Badge
                    className={`text-xs border capitalize ${getOrderStatusColor(selectedOrder.orderStatus)}`}
                  >
                    {selectedOrder.orderStatus}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Customer
                    </p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.customerInfo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Delivery
                    </p>
                    <p className="font-medium">
                      {selectedOrder.customerInfo.city}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.customerInfo.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Payment
                    </p>
                    <p className="font-medium">
                      {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                    </p>
                    <Badge
                      variant={
                        selectedOrder.paymentStatus ? "default" : "secondary"
                      }
                      className={
                        selectedOrder.paymentStatus
                          ? "bg-green-100 text-green-700 text-xs"
                          : "text-xs"
                      }
                    >
                      {selectedOrder.paymentStatus ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={`${item.productId.toString()}-${item.size}-${item.color}`}
                      className="flex justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} / {item.color} × {Number(item.quantity)}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatNPR(item.price * Number(item.quantity))}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {selectedOrder.discountApplied &&
                  selectedOrder.discountApplied > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatNPR(selectedOrder.discountApplied)}</span>
                    </div>
                  )}
                <div className="flex justify-between font-heading font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatNPR(selectedOrder.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Update Status:
                  </span>
                  <Select
                    value={selectedOrder.orderStatus}
                    onValueChange={(v) =>
                      void handleStatusChange(selectedOrder.id, v)
                    }
                  >
                    <SelectTrigger className="flex-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.slice(1).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
