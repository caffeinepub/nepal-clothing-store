import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderById } from "@/hooks/useQueries";
import { formatDate, formatNPR, getPaymentMethodLabel } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Home, Package } from "lucide-react";

export function OrderConfirmationPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: order, isLoading } = useOrderById(BigInt(id));

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you a confirmation shortly.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Order #{id}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Separator />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-12 h-14 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : order ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Order Details Header */}
          <div className="bg-secondary/50 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="text-sm font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-medium">
                {getPaymentMethodLabel(order.paymentMethod)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 capitalize">
                {order.orderStatus}
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Delivery Info */}
            <div>
              <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
                Delivery Address
              </h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">
                  {order.customerInfo.name}
                </p>
                <p>{order.customerInfo.phone}</p>
                <p>
                  {order.customerInfo.address}, {order.customerInfo.city}
                </p>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${item.productId.toString()}-${item.size}-${item.color}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} / {item.color} × {Number(item.quantity)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {formatNPR(item.price * Number(item.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="space-y-2 text-sm">
              {order.discountApplied && order.discountApplied > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied</span>
                  <span>-{formatNPR(order.discountApplied)}</span>
                </div>
              )}
              <div className="flex justify-between font-heading font-bold text-base">
                <span>Total Amount</span>
                <span className="text-primary">
                  {formatNPR(order.totalAmount)}
                </span>
              </div>
              {order.paymentMethod === "cod" && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  💵 Please keep {formatNPR(order.totalAmount)} ready for cash
                  on delivery
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Order details not available</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to="/account" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <Package className="w-4 h-4" />
            Track My Orders
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button className="w-full bg-primary text-primary-foreground gap-2">
            <Home className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
