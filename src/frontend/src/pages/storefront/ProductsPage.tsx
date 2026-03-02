import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductGridSkeleton } from "@/components/storefront/ProductSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useCategories, useProducts } from "@/hooks/useQueries";
import { formatNPR } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

const GENDERS = ["Men", "Women", "Kids", "Unisex"];

interface FilterState {
  search: string;
  gender: string | null;
  categoryId: string | null;
  minPrice: number;
  maxPrice: number;
}

export function ProductsPage() {
  const searchParams = useSearch({ strict: false }) as {
    search?: string;
    gender?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.search ?? "",
    gender: searchParams.gender || null,
    categoryId: searchParams.categoryId || null,
    minPrice: Number(searchParams.minPrice ?? 0),
    maxPrice: Number(searchParams.maxPrice ?? 50000) || 50000,
  });

  const [priceRange, setPriceRange] = useState([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts(
    filters.categoryId ? BigInt(filters.categoryId) : null,
    filters.gender,
    filters.minPrice > 0 ? filters.minPrice : null,
    filters.maxPrice < 50000 ? filters.maxPrice : null,
    filters.search || null,
  );

  // Sync URL search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.gender) params.gender = filters.gender;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.minPrice > 0) params.minPrice = filters.minPrice.toString();
    if (filters.maxPrice < 50000) params.maxPrice = filters.maxPrice.toString();
    void navigate({
      to: "/products",
      search: {
        search: params.search ?? "",
        gender: params.gender ?? "",
        categoryId: params.categoryId ?? "",
        minPrice: params.minPrice ?? "",
        maxPrice: params.maxPrice ?? "",
      },
      replace: true,
    });
  }, [filters, navigate]);

  const activeFilterCount = [
    filters.search,
    filters.gender,
    filters.categoryId,
    filters.minPrice > 0 || filters.maxPrice < 50000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      search: "",
      gender: null,
      categoryId: null,
      minPrice: 0,
      maxPrice: 50000,
    });
    setPriceRange([0, 50000]);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Search</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Gender */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Gender</p>
        <div className="space-y-2">
          {GENDERS.map((g) => (
            <div key={g} className="flex items-center gap-2 group">
              <Checkbox
                id={`gender-${g}`}
                checked={filters.gender === g}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({ ...f, gender: checked ? g : null }))
                }
              />
              <label
                htmlFor={`gender-${g}`}
                className="text-sm text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
              >
                {g}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      {categories && categories.length > 0 && (
        <>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Category
            </p>
            <div className="space-y-2">
              {categories
                .filter((c) => c.isActive)
                .map((cat) => (
                  <div
                    key={cat.id.toString()}
                    className="flex items-center gap-2 group"
                  >
                    <Checkbox
                      id={`cat-${cat.id.toString()}`}
                      checked={filters.categoryId === cat.id.toString()}
                      onCheckedChange={(checked) =>
                        setFilters((f) => ({
                          ...f,
                          categoryId: checked ? cat.id.toString() : null,
                        }))
                      }
                    />
                    <label
                      htmlFor={`cat-${cat.id.toString()}`}
                      className="text-sm text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Price Range */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">
          Price Range
        </p>
        <Slider
          value={priceRange}
          onValueChange={(val) => setPriceRange(val)}
          onValueCommit={(val) =>
            setFilters((f) => ({ ...f, minPrice: val[0], maxPrice: val[1] }))
          }
          min={0}
          max={50000}
          step={500}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatNPR(priceRange[0])}</span>
          <span>{formatNPR(priceRange[1])}</span>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-1.5" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            {filters.gender ? `${filters.gender}'s Collection` : "All Products"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${products?.length ?? 0} products found`}
          </p>
        </div>

        {/* Active filter badges */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          {filters.gender && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => setFilters((f) => ({ ...f, gender: null }))}
            >
              {filters.gender}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.search && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => setFilters((f) => ({ ...f, search: "" }))}
            >
              "{filters.search}"
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {/* Mobile filter button */}
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-sm uppercase tracking-wide text-foreground">
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </h2>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your filters or search term
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
