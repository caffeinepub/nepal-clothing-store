import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAllOrders, useProducts } from "@/hooks/useQueries";
import { formatDate, formatNPR, getOrderStatusColor } from "@/lib/helpers";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Clock,
  DollarSign,
  Image,
  Package,
  ShoppingBag,
  Tag,
  Ticket,
  X,
} from "lucide-react";
import { OrderStatus } from "../../backend.d";

export function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { newOrdersCount, markAllSeen } = useAdminNotifications();

  const stats = {
    totalRevenue: orders?.reduce((sum, o) => sum + o.totalAmount, 0) ?? 0,
    totalOrders: orders?.length ?? 0,
    pendingOrders:
      orders?.filter((o) => o.orderStatus === OrderStatus.pending).length ?? 0,
    totalProducts: products?.length ?? 0,
  };

  const recentOrders = orders?.slice(0, 8) ?? [];

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: formatNPR(stats.totalRevenue),
      icon: DollarSign,
      trend: "+12% this month",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trendColor: "text-primary",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      trend: `${stats.pendingOrders} pending`,
      iconBg: "bg-accent/20",
      iconColor: "text-accent-foreground",
      trendColor: "text-muted-foreground",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      trend: "Needs attention",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      trendColor: "text-destructive/70",
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: "In catalog",
      iconBg: "bg-secondary",
      iconColor: "text-secondary-foreground",
      trendColor: "text-muted-foreground",
    },
  ];

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="space-y-6">
      {/* New Order Alert Banner */}
      {newOrdersCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">
              {newOrdersCount} new order{newOrdersCount !== 1 ? "s" : ""}{" "}
              received!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
              onClick={markAllSeen}
            >
              View Orders
            </Link>
            <button
              type="button"
              onClick={markAllSeen}
              className="w-6 h-6 flex items-center justify-center text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
        >
          View all orders <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="shadow-admin-card border-border hover:shadow-product transition-shadow duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mt-1 text-right leading-tight max-w-[7rem]">
                    {stat.label}
                  </p>
                </div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-28 mb-1.5" />
                    <Skeleton className="h-3.5 w-20" />
                  </>
                ) : (
                  <>
                    <p className="font-heading font-bold text-[1.65rem] leading-none text-foreground tracking-tight">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs mt-1.5 font-medium ${stat.trendColor}`}
                    >
                      {stat.trend}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="shadow-admin-card border-border">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading font-semibold tracking-tight">
              Recent Orders
            </CardTitle>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Items
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id.toString()}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {order.customerInfo.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.customerInfo.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="font-heading font-bold text-sm text-foreground">
                        {formatNPR(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs border capitalize font-medium ${getOrderStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-14 px-6 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground/60" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  No orders yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Orders placed in your store will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              href: "/admin/products/new",
              label: "Add Product",
              icon: Package,
              desc: "New listing",
            },
            {
              href: "/admin/categories",
              label: "Categories",
              icon: Tag,
              desc: "Organize products",
            },
            {
              href: "/admin/banners",
              label: "Manage Banners",
              icon: Image,
              desc: "Homepage display",
            },
            {
              href: "/admin/discounts",
              label: "Discount Codes",
              icon: Ticket,
              desc: "Create offers",
            },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href as "/"}>
                <Card className="group hover:border-primary/40 hover:shadow-admin-card transition-all cursor-pointer border-border">
                  <CardContent className="p-4">
                    <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-4 h-4 text-secondary-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
