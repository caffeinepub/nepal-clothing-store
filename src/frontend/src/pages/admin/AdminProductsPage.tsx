import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteProduct, useProducts } from "@/hooks/useQueries";
import { formatNPR } from "@/lib/helpers";
import { Link, useNavigate } from "@tanstack/react-router";
import { Edit, Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts(
    null,
    null,
    null,
    null,
    search || null,
  );
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success(`"${name}" deleted successfully`);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {products?.length ?? 0} total products
          </p>
        </div>
        <Button
          onClick={() => void navigate({ to: "/admin/products/new" })}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-admin-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const imageUrl =
                    product.images.length > 0
                      ? product.images[0].getDirectURL()
                      : "/assets/generated/product-kurta-men.dim_600x700.jpg";
                  return (
                    <TableRow key={product.id.toString()}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-10 h-12 object-cover rounded-lg bg-secondary/30 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          #{product.category.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {product.gender}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            {formatNPR(
                              product.discountedPrice ?? product.price,
                            )}
                          </p>
                          {product.discountedPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatNPR(product.price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${
                            Number(product.stock) === 0
                              ? "text-destructive"
                              : Number(product.stock) < 5
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {Number(product.stock)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ""
                          }
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/admin/products/$id/edit"
                            params={{ id: product.id.toString() }}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() =>
                                    void handleDelete(product.id, product.name)
                                  }
                                >
                                  {deleteProduct.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-foreground mb-1">
              No products yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start by adding your first product
            </p>
            <Link to="/admin/products/new">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
