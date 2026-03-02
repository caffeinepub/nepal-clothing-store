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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useQueries";
import { Edit, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "../../backend.d";

export function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: form.name,
          description: form.description,
        });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({
          name: form.name,
          description: form.description,
        });
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage product categories
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-admin-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div
                key={cat.id.toString()}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">
                        {cat.name}
                      </p>
                      <Badge
                        variant={cat.isActive ? "default" : "secondary"}
                        className={
                          cat.isActive
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : "text-xs"
                        }
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(cat)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
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
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete "{cat.name}"? Products in this category may be
                          affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground"
                          onClick={() => void handleDelete(cat.id, cat.name)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No categories yet</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label
                htmlFor="cat-name"
                className="text-sm font-medium mb-1.5 block"
              >
                Name *
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Ethnic Wear, Casual, Formal"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                htmlFor="cat-desc"
                className="text-sm font-medium mb-1.5 block"
              >
                Description
              </Label>
              <Textarea
                id="cat-desc"
                placeholder="Short description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
