import { BannerCarousel } from "@/components/storefront/BannerCarousel";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGridSkeleton } from "@/components/storefront/ProductSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useActiveBanners,
  useCategories,
  useProducts,
} from "@/hooks/useQueries";
import { formatNPR } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Shield, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";

const GENDER_CATEGORIES = [
  {
    label: "Men's",
    gender: "Men",
    image: "/assets/generated/product-daura-suruwal.dim_600x700.jpg",
    color: "from-blue-900/70 to-blue-600/40",
  },
  {
    label: "Women's",
    gender: "Women",
    image: "/assets/generated/product-salwar-women.dim_600x700.jpg",
    color: "from-rose-900/70 to-rose-500/40",
  },
  {
    label: "Kids'",
    gender: "Kids",
    image: "/assets/generated/product-kids-ethnic.dim_600x700.jpg",
    color: "from-amber-900/70 to-amber-500/40",
  },
  {
    label: "Ethnic Wear",
    gender: "Unisex",
    image: "/assets/generated/product-saree-women.dim_600x700.jpg",
    color: "from-purple-900/70 to-purple-500/40",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Handpicked fabrics from across Nepal",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "COD, eSewa & Khalti accepted",
  },
  {
    icon: TrendingUp,
    title: "Latest Trends",
    description: "New arrivals every week",
  },
];

// Demo products shown when backend is loading or empty
const DEMO_PRODUCTS = [
  {
    id: 1n,
    name: "Embroidered Kurta Suruwal Set",
    description: "Traditional Nepali kurta with intricate embroidery",
    price: 3500,
    discountedPrice: 2800,
    category: 1n,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue"],
    gender: "Men",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-kurta-men.dim_600x700.jpg",
      },
    ],
    stock: 15n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: 2n,
    name: "Silk Salwar Kameez with Dupatta",
    description: "Elegant silk suit perfect for festive occasions",
    price: 5200,
    discountedPrice: undefined,
    category: 2n,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Green", "Gold"],
    gender: "Women",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-salwar-women.dim_600x700.jpg",
      },
    ],
    stock: 8n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: 3n,
    name: "Casual Denim Jacket & Chinos",
    description: "Modern casual look for everyday wear",
    price: 4200,
    discountedPrice: 3500,
    category: 3n,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Denim Blue", "Khaki"],
    gender: "Men",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-casual-men.dim_600x700.jpg",
      },
    ],
    stock: 22n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: 4n,
    name: "Kids Festive Kurta Set",
    description: "Adorable traditional wear for the little ones",
    price: 1800,
    discountedPrice: undefined,
    category: 1n,
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Red", "Gold"],
    gender: "Kids",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-kids-ethnic.dim_600x700.jpg",
      },
    ],
    stock: 30n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: 5n,
    name: "Banarasi Silk Saree",
    description: "Classic silk saree with golden border, perfect for Dashain",
    price: 8500,
    discountedPrice: 7200,
    category: 2n,
    sizes: ["Free Size"],
    colors: ["Red", "Maroon"],
    gender: "Women",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-saree-women.dim_600x700.jpg",
      },
    ],
    stock: 5n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: 6n,
    name: "Traditional Daura Suruwal",
    description: "Classic Nepali national dress, ideal for Tihar and Dashain",
    price: 6000,
    discountedPrice: undefined,
    category: 1n,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "White"],
    gender: "Men",
    images: [
      {
        getDirectURL: () =>
          "/assets/generated/product-daura-suruwal.dim_600x700.jpg",
      },
    ],
    stock: 12n,
    isActive: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const { data: banners, isLoading: bannersLoading } = useActiveBanners();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      void navigate({
        to: "/products",
        search: {
          search: searchInput.trim(),
          gender: "",
          categoryId: "",
          minPrice: "",
          maxPrice: "",
        },
      });
    }
  };

  const displayProducts = products?.length
    ? products.slice(0, 6)
    : DEMO_PRODUCTS;

  return (
    <main>
      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 pt-6 pb-10">
        <BannerCarousel banners={banners} loading={bannersLoading} />

        {/* Search bar floating below banner */}
        <form
          onSubmit={handleSearch}
          className="relative mx-auto mt-6 max-w-2xl"
        >
          <div className="flex items-center bg-card border border-border rounded-xl shadow-product overflow-hidden">
            <Search className="ml-4 w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              type="search"
              placeholder="Search for kurtas, sarees, jackets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent text-base px-3"
            />
            <Button
              type="submit"
              className="m-1 bg-primary text-primary-foreground rounded-lg"
              size="sm"
            >
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Features Strip */}
      <section className="bg-secondary/40 border-y border-border py-4">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-center gap-3 justify-center sm:justify-start"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">
                      {f.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Explore our curated collections
            </p>
          </div>
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
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {GENDER_CATEGORIES.map((cat) => (
            <Link
              key={cat.gender}
              to="/products"
              search={{
                search: "",
                gender: cat.gender,
                categoryId: "",
                minPrice: "",
                maxPrice: "",
              }}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-white">
                <h3 className="font-heading font-bold text-lg md:text-xl text-center">
                  {cat.label}
                </h3>
                <p className="text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop Now →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Dynamic categories from backend */}
        {categories && categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {categories
              .filter((c) => c.isActive)
              .map((cat) => (
                <Link
                  key={cat.id.toString()}
                  to="/products"
                  search={{
                    search: "",
                    gender: "",
                    categoryId: cat.id.toString(),
                    minPrice: "",
                    maxPrice: "",
                  }}
                  className="px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-sm font-medium text-secondary-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Handpicked for you
            </p>
          </div>
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
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {productsLoading ? (
          <ProductGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {(displayProducts as typeof DEMO_PRODUCTS).map((product) => (
              <ProductCard
                key={product.id.toString()}
                product={product as never}
              />
            ))}
          </div>
        )}
      </section>

      {/* Festive Sale Banner */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground p-8 md:p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-primary-foreground/70 text-sm uppercase tracking-widest font-medium mb-2">
                Dashain & Tihar Special
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Up to 40% Off
              </h2>
              <p className="text-primary-foreground/80">
                On selected ethnic wear and festive collections
              </p>
            </div>
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
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-heading font-bold shrink-0"
              >
                Shop Sale →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Price Range Quick Filter */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
          Shop by Budget
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Under NPR 1,000", max: 1000 },
            { label: "NPR 1,000 – 3,000", min: 1000, max: 3000 },
            { label: "NPR 3,000 – 6,000", min: 3000, max: 6000 },
            { label: "NPR 6,000+", min: 6000 },
          ].map((range) => (
            <Link
              key={range.label}
              to="/products"
              search={{
                search: "",
                gender: "",
                categoryId: "",
                minPrice: range.min?.toString() ?? "",
                maxPrice: range.max?.toString() ?? "",
              }}
              className="group p-4 border border-border rounded-xl text-center hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
            >
              <p className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {range.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNPR(range.min ?? 0)} –{" "}
                {range.max ? formatNPR(range.max) : "above"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
