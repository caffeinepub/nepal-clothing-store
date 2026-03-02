import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useCategories, useProductById } from "@/hooks/useQueries";
import { formatNPR } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProductDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: product, isLoading } = useProductById(BigInt(id));
  const { data: categories } = useCategories();
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto max-w-6xl px-4 py-16 text-center">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">
          Product not found
        </h2>
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
          <Button variant="outline">Back to Products</Button>
        </Link>
      </main>
    );
  }

  const images =
    product.images.length > 0
      ? product.images.map((img) => img.getDirectURL())
      : ["/assets/generated/product-kurta-men.dim_600x700.jpg"];

  const effectivePrice = product.discountedPrice ?? product.price;
  const discountPct =
    product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100,
        )
      : null;

  const categoryName =
    categories?.find((c) => c.id === product.category)?.name ?? "";
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor && product.colors.length > 0) {
      toast.error("Please select a color");
      return;
    }

    addItem({
      productId: product.id.toString(),
      name: product.name,
      price: effectivePrice,
      quantity,
      size: selectedSize || "One Size",
      color: selectedColor || "Default",
      imageUrl: images[0],
    });

    toast.success("Added to cart!", {
      description: `${product.name} — ${selectedSize || "One Size"} / ${selectedColor || "Default"}`,
    });
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          to="/products"
          search={{
            search: "",
            gender: "",
            categoryId: "",
            minPrice: "",
            maxPrice: "",
          }}
          className="hover:text-foreground transition-colors"
        >
          Products
        </Link>
        {categoryName && (
          <>
            <span>/</span>
            <span className="text-foreground">{categoryName}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: image index is stable
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {categoryName && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {categoryName}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs capitalize">
                {product.gender}
              </Badge>
              {!inStock && (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-heading font-bold text-3xl text-primary">
              {formatNPR(effectivePrice)}
            </span>
            {discountPct && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatNPR(product.price)}
                </span>
                <Badge className="badge-discount text-white border-0">
                  {discountPct}% OFF
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          <Separator />

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
                Size
                {selectedSize && (
                  <span className="font-normal text-primary">
                    {selectedSize}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/60 text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
                Color
                {selectedColor && (
                  <span className="font-normal text-primary">
                    {selectedColor}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all flex items-center gap-1.5 ${
                      selectedColor === color
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/60 text-foreground"
                    }`}
                  >
                    {selectedColor === color && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Number(product.stock), q + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity >= Number(product.stock)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {Number(product.stock)} in stock
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold gap-2 h-12"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingCart className="w-5 h-5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>

          <Separator />

          {/* Policies */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              {
                icon: Package,
                label: "Free Delivery",
                sub: "On orders over NPR 2,000",
              },
              { icon: Truck, label: "Fast Shipping", sub: "2-5 business days" },
              {
                icon: RotateCcw,
                label: "Easy Returns",
                sub: "7-day return policy",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {item.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
