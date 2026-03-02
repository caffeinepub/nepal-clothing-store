import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border/50">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-3.5 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-24 mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => `sk-${i}`).map((key) => (
        <ProductSkeleton key={key} />
      ))}
    </div>
  );
}
