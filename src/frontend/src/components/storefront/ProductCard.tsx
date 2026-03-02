import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatNPR } from "@/lib/helpers";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../../backend.d";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const imageUrl =
    product.images.length > 0
      ? product.images[0].getDirectURL()
      : "/assets/generated/product-kurta-men.dim_600x700.jpg";

  const discountPct =
    product.discountedPrice && product.discountedPrice < product.price
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100,
        )
      : null;

  const effectivePrice = product.discountedPrice ?? product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const size = product.sizes[0] ?? "One Size";
    const color = product.colors[0] ?? "Default";

    addItem({
      productId: product.id.toString(),
      name: product.name,
      price: effectivePrice,
      quantity: 1,
      size,
      color,
      imageUrl,
    });

    toast.success(`${product.name} added to cart`, {
      description: `${size} / ${color}`,
    });
  };

  return (
    <Link to="/products/$id" params={{ id: product.id.toString() }}>
      <article className="group bg-card rounded-xl overflow-hidden shadow-product hover:shadow-product-hover transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay */}
          <div className="absolute inset-0 product-card-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct && (
              <Badge className="badge-discount text-white border-0 text-xs font-semibold px-2 py-0.5">
                -{discountPct}%
              </Badge>
            )}
            {Number(product.stock) === 0 && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </button>

          {/* Quick Add button */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="sm"
              className="w-full bg-card/90 text-foreground hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary text-xs font-medium backdrop-blur-sm"
              onClick={handleQuickAdd}
              disabled={Number(product.stock) === 0}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-xs text-muted-foreground capitalize mb-0.5">
            {product.gender}
          </p>
          <h3 className="font-heading font-semibold text-sm text-foreground line-clamp-2 mb-2 leading-tight">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-base text-primary">
              {formatNPR(effectivePrice)}
            </span>
            {discountPct && (
              <span className="text-xs text-muted-foreground line-through">
                {formatNPR(product.price)}
              </span>
            )}
          </div>

          {/* Sizes preview */}
          {product.sizes.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {product.sizes.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="text-xs border border-border rounded px-1.5 py-0.5 text-muted-foreground"
                >
                  {s}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
