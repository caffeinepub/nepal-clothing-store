import { Badge } from "@/components/ui/badge";
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
import { useAllOrders, useProducts } from "@/hooks/useQueries";
import { formatDate, formatNPR, getOrderStatusColor } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { OrderStatus } from "../../backend.d";

export function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

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
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      trend: `${stats.pendingOrders} pending`,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      trend: "Needs attention",
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: "In catalog",
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all orders <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-admin-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                {ordersLoading || productsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="font-heading font-bold text-2xl text-foreground">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="shadow-admin-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading font-semibold">
              Recent Orders
            </CardTitle>
            <Link
              to="/admin/orders"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id.toString()}>
                      <TableCell className="font-mono text-xs">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {order.customerInfo.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerInfo.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatNPR(order.totalAmount)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/products/new", label: "Add Product", icon: Package },
          { href: "/admin/categories", label: "Categories", icon: TrendingUp },
          { href: "/admin/banners", label: "Manage Banners", icon: TrendingUp },
          {
            href: "/admin/discounts",
            label: "Discount Codes",
            icon: TrendingUp,
          },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} to={link.href as "/"}>
              <Card className="hover:border-primary/50 hover:shadow-admin-card transition-all cursor-pointer border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {link.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
