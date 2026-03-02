import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCallerProfile,
  useMyOrders,
  useSaveProfile,
} from "@/hooks/useQueries";
import {
  NEPAL_CITIES,
  formatDate,
  formatNPR,
  getOrderStatusColor,
  getPaymentMethodLabel,
} from "@/lib/helpers";
import { Loader2, LogIn, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AccountPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        city: profile.city ?? "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync(form);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!identity) {
    return (
      <main className="container mx-auto max-w-md px-4 py-16 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
          Sign in to your account
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          View your orders, manage your profile, and track deliveries
        </p>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground gap-2"
          onClick={login}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoggingIn ? "Signing in..." : "Sign In"}
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
        My Account
      </h1>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id.toString()}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-heading font-semibold text-sm text-foreground">
                        Order #{order.id.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.createdAt)} ·{" "}
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs border capitalize ${getOrderStatusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>

                  <Separator className="mb-3" />

                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={`${item.productId.toString()}-${item.size}-${item.color}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.name}{" "}
                          <span className="text-xs">
                            ({item.size} / {item.color}) ×{" "}
                            {Number(item.quantity)}
                          </span>
                        </span>
                        <span className="font-medium">
                          {formatNPR(item.price * Number(item.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="mt-3 mb-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-heading font-bold text-primary">
                      {formatNPR(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Your order history will appear here
              </p>
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Personal Information
            </h2>
            {profileLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="p-name"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="p-name"
                    placeholder="Ram Prasad Sharma"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="p-phone"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="p-phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="p-city"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    City
                  </Label>
                  <Select
                    value={form.city}
                    onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  >
                    <SelectTrigger id="p-city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEPAL_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="p-address"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    Address
                  </Label>
                  <Input
                    id="p-address"
                    placeholder="Ward No., Tole, Street"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>
                <Button
                  onClick={() => void handleSave()}
                  disabled={saveProfile.isPending}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
