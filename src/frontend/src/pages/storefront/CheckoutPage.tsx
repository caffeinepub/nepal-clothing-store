import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  PaymentMethod,
  useCreateOrder,
  useValidateDiscountCode,
} from "@/hooks/useQueries";
import { NEPAL_CITIES, calculateDiscount, formatNPR } from "@/lib/helpers";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  CreditCard,
  Info,
  Loader2,
  LogIn,
  SmartphoneNfc,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiscountCode } from "../../backend.d";

const PAYMENT_METHODS = [
  {
    id: PaymentMethod.cod,
    label: "Cash on Delivery",
    description: "Pay when you receive",
    icon: Banknote,
  },
  {
    id: PaymentMethod.esewa,
    label: "eSewa",
    description: "Pay via eSewa wallet",
    icon: SmartphoneNfc,
  },
  {
    id: PaymentMethod.khalti,
    label: "Khalti",
    description: "Pay via Khalti digital wallet",
    icon: CreditCard,
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const createOrder = useCreateOrder();
  const validateDiscount = useValidateDiscountCode();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cod,
  );
  const [paymentSimulated, setPaymentSimulated] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null,
  );
  const [showGuestConfirm, setShowGuestConfirm] = useState(false);

  const discountAmount = calculateDiscount(subtotal, appliedDiscount);
  const deliveryFee = subtotal >= 2000 ? 0 : 150;
  const total = subtotal - discountAmount + deliveryFee;

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    try {
      const code = await validateDiscount.mutateAsync(
        discountInput.trim().toUpperCase(),
      );
      if (code) {
        setAppliedDiscount(code);
        toast.success(
          `Discount applied! Save ${formatNPR(calculateDiscount(subtotal, code))}`,
        );
      } else {
        toast.error("Invalid or expired discount code");
      }
    } catch {
      toast.error("Could not validate discount code");
    }
  };

  const handleSimulatePayment = () => {
    setPaymentSimulated(true);
    toast.success(
      `${paymentMethod === PaymentMethod.esewa ? "eSewa" : "Khalti"} payment simulated successfully`,
      { description: "Proceeding with order..." },
    );
  };

  const validateForm = (): boolean => {
    if (
      !customerInfo.name ||
      !customerInfo.phone ||
      !customerInfo.address ||
      !customerInfo.city
    ) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (customerInfo.phone.length < 10) {
      toast.error("Please enter a valid Nepal phone number (98XXXXXXXX)");
      return false;
    }
    if (
      (paymentMethod === PaymentMethod.esewa ||
        paymentMethod === PaymentMethod.khalti) &&
      !paymentSimulated
    ) {
      toast.error("Please complete the payment simulation first");
      return false;
    }
    return true;
  };

  const submitOrder = async () => {
    const orderItems = items.map((item) => ({
      productId: BigInt(item.productId),
      name: item.name,
      price: item.price,
      quantity: BigInt(item.quantity),
      size: item.size,
      color: item.color,
    }));

    try {
      const orderId = await createOrder.mutateAsync({
        items: orderItems,
        customerInfo,
        paymentMethod,
        discountApplied: discountAmount > 0 ? discountAmount : null,
      });

      clearCart();
      void navigate({
        to: "/order-confirmation/$id",
        params: { id: orderId.toString() },
      });
    } catch (err) {
      // Backend requires user role — show friendly sign-in prompt
      const errorMsg =
        err instanceof Error ? err.message.toLowerCase() : String(err);
      const isAuthError =
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("not authorized") ||
        errorMsg.includes("caller is not") ||
        errorMsg.includes("anonymous") ||
        errorMsg.includes("permission");

      if (isAuthError || !identity) {
        toast.error("Sign in required to place an order", {
          description:
            "Guest checkout is not available yet. Please sign in to continue.",
          action: {
            label: "Sign In",
            onClick: login,
          },
          duration: 6000,
        });
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // If not logged in, show guest confirmation dialog
    if (!identity) {
      setShowGuestConfirm(true);
      return;
    }

    await submitOrder();
  };

  const handleConfirmGuest = async () => {
    setShowGuestConfirm(false);
    await submitOrder();
  };

  if (items.length === 0) {
    void navigate({ to: "/cart" });
    return null;
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
        Checkout
      </h1>

      {/* Sign-in nudge banner — non-blocking */}
      {!identity && (
        <div className="flex items-center gap-3 p-3 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800 flex-1">
            <button
              type="button"
              onClick={login}
              className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors"
            >
              Sign in
            </button>{" "}
            to track your orders — or continue as guest below.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={login}
            className="shrink-0 h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <LogIn className="w-3 h-3" />
            Sign In
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Ram Prasad Sharma"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo((p) => ({ ...p, phone: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nepal mobile format
                </p>
              </div>
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-1.5 block"
                >
                  City *
                </Label>
                <Select
                  value={customerInfo.city}
                  onValueChange={(v) =>
                    setCustomerInfo((p) => ({ ...p, city: v }))
                  }
                >
                  <SelectTrigger id="city">
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
              <div className="sm:col-span-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Full Address *
                </Label>
                <Input
                  id="address"
                  placeholder="Ward No., Tole, Street Name"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id);
                      setPaymentSimulated(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">
                        {method.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Payment simulation for digital wallets */}
            {(paymentMethod === PaymentMethod.esewa ||
              paymentMethod === PaymentMethod.khalti) && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                {paymentSimulated ? (
                  <p className="text-sm text-green-700 font-medium">
                    ✓{" "}
                    {paymentMethod === PaymentMethod.esewa ? "eSewa" : "Khalti"}{" "}
                    payment simulated successfully
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-amber-700">
                      Click to simulate{" "}
                      {paymentMethod === PaymentMethod.esewa
                        ? "eSewa"
                        : "Khalti"}{" "}
                      payment
                    </p>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                      onClick={handleSimulatePayment}
                    >
                      Pay {formatNPR(total)}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-2.5"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-lg bg-secondary/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {formatNPR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Discount Code */}
            <div className="mb-4">
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-xs font-semibold text-green-700">
                    {appliedDiscount.code}
                  </span>
                  <span className="text-xs text-green-600">
                    Save {formatNPR(discountAmount)}
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code"
                    value={discountInput}
                    onChange={(e) =>
                      setDiscountInput(e.target.value.toUpperCase())
                    }
                    className="text-sm uppercase h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleApplyDiscount();
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleApplyDiscount()}
                    disabled={validateDiscount.isPending}
                    className="h-9 shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNPR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatNPR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                  {deliveryFee === 0 ? "Free" : formatNPR(deliveryFee)}
                </span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between font-heading font-bold text-base mb-4">
              <span>Total</span>
              <span className="text-primary">{formatNPR(total)}</span>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold"
              onClick={() => void handlePlaceOrder()}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>

            {!identity && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                <button
                  type="button"
                  onClick={login}
                  className="text-primary underline underline-offset-2 font-medium"
                >
                  Sign in
                </button>{" "}
                to track your orders after purchase
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Guest Checkout Confirmation Dialog */}
      <Dialog open={showGuestConfirm} onOpenChange={setShowGuestConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Continue as Guest?
            </DialogTitle>
            <DialogDescription>
              You won't be able to track this order later without signing in.
              Your order details will be sent via phone contact only.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGuestConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowGuestConfirm(false);
                login();
              }}
              className="flex-1 gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In Instead
            </Button>
            <Button
              onClick={() => void handleConfirmGuest()}
              disabled={createOrder.isPending}
              className="flex-1"
            >
              {createOrder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Continue as Guest"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
