import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useValidateDiscountCode } from "@/hooks/useQueries";
import { calculateDiscount, formatNPR } from "@/lib/helpers";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiscountCode } from "../../backend.d";

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();
  const validateDiscount = useValidateDiscountCode();
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(
    null,
  );

  const discountAmount = calculateDiscount(subtotal, appliedDiscount);
  const total = subtotal - discountAmount;

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    try {
      const code = await validateDiscount.mutateAsync(
        discountInput.trim().toUpperCase(),
      );
      if (code) {
        setAppliedDiscount(code);
        toast.success(`Discount code "${code.code}" applied!`, {
          description: `You save ${formatNPR(calculateDiscount(subtotal, code))}`,
        });
      } else {
        toast.error("Invalid or expired discount code");
      }
    } catch {
      toast.error("Could not validate discount code");
    }
  };

  const handleCheckout = () => {
    void navigate({ to: "/checkout" });
  };

  if (items.length === 0) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any items yet. Start shopping!
        </p>
        <Link
          to="/products"
          search={{
            search: "",
            gender: "",
            categoryId: "",
            minPrice: "",
            maxPrice: "",
          }}
        >
          <Button size="lg" className="bg-primary text-primary-foreground">
            Browse Products
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-muted-foreground">
          ({items.length} item{items.length !== 1 ? "s" : ""})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              <Link
                to="/products/$id"
                params={{ id: item.productId }}
                className="shrink-0"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-24 object-cover rounded-lg bg-secondary/30"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to="/products/$id" params={{ id: item.productId }}>
                      <h3 className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {item.size}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {item.color}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity - 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity + 1,
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-heading font-semibold text-primary">
                    {formatNPR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/products"
            search={{
              search: "",
              gender: "",
              categoryId: "",
              minPrice: "",
              maxPrice: "",
            }}
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-heading font-semibold text-base text-foreground mb-4">
              Order Summary
            </h2>

            {/* Discount Code */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Discount Code
              </p>
              {appliedDiscount ? (
                <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <Badge className="bg-green-600 text-white text-xs">
                    {appliedDiscount.code}
                  </Badge>
                  <span className="text-xs text-green-700 flex-1">
                    -
                    {discountAmount > 0
                      ? formatNPR(discountAmount)
                      : `${appliedDiscount.value}${appliedDiscount.discountType === "percentage" ? "%" : " NPR"}`}{" "}
                    off
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedDiscount(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={discountInput}
                    onChange={(e) =>
                      setDiscountInput(e.target.value.toUpperCase())
                    }
                    className="text-sm uppercase"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleApplyDiscount()
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyDiscount}
                    disabled={validateDiscount.isPending}
                    className="shrink-0"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            <Separator className="mb-4" />

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatNPR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatNPR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span className={subtotal >= 2000 ? "text-green-600" : ""}>
                  {subtotal >= 2000 ? "Free" : formatNPR(150)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-heading font-bold text-lg mb-5">
              <span>Total</span>
              <span className="text-primary">
                {formatNPR(total + (subtotal >= 2000 ? 0 : 150))}
              </span>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold gap-2"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Secure checkout • COD available
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
