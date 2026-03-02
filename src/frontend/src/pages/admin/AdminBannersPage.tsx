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
import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/hooks/useQueries";
import { Edit, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Banner } from "../../backend.d";

export function AdminBannersPage() {
  const { data: banners, isLoading } = useAllBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    displayOrder: "1",
  });

  const openCreate = () => {
    setEditingBanner(null);
    setForm({
      title: "",
      imageUrl: "",
      linkUrl: "/products",
      displayOrder: "1",
    });
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      imageUrl: banner.imageRef.getDirectURL(),
      linkUrl: banner.linkUrl,
      displayOrder: Number(banner.displayOrder).toString(),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error("Title and image URL are required");
      return;
    }
    const imageRef = ExternalBlob.fromURL(form.imageUrl);
    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({
          id: editingBanner.id,
          title: form.title,
          imageRef,
          linkUrl: form.linkUrl,
          displayOrder: BigInt(Number.parseInt(form.displayOrder) || 1),
        });
        toast.success("Banner updated");
      } else {
        await createBanner.mutateAsync({
          title: form.title,
          imageRef,
          linkUrl: form.linkUrl,
          displayOrder: BigInt(Number.parseInt(form.displayOrder) || 1),
        });
        toast.success("Banner created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: bigint, title: string) => {
    try {
      await deleteBanner.mutateAsync(id);
      toast.success(`"${title}" deleted`);
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const isSubmitting = createBanner.isPending || updateBanner.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Banners
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage homepage carousel banners
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : banners && banners.length > 0 ? (
          banners.map((banner) => (
            <div
              key={banner.id.toString()}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-admin-card flex"
            >
              <div className="w-48 shrink-0 bg-secondary/30">
                <img
                  src={banner.imageRef.getDirectURL()}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-heading font-semibold text-sm text-foreground">
                      {banner.title}
                    </h3>
                    <Badge
                      variant={banner.isActive ? "default" : "secondary"}
                      className={
                        banner.isActive
                          ? "bg-green-100 text-green-700 border-green-200 text-xs"
                          : "text-xs"
                      }
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link: {banner.linkUrl}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order: #{Number(banner.displayOrder)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(banner)}
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
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete "{banner.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground"
                          onClick={() =>
                            void handleDelete(banner.id, banner.title)
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-10 text-center shadow-admin-card">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No banners yet</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingBanner ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Title *
              </Label>
              <Input
                placeholder="e.g. Festive Collection 2081"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Image URL *
              </Label>
              <Input
                placeholder="https://example.com/banner.jpg"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 w-full h-24 object-cover rounded-lg border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Link URL
              </Label>
              <Input
                placeholder="/products"
                value={form.linkUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkUrl: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Display Order
              </Label>
              <Input
                type="number"
                min="1"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayOrder: e.target.value }))
                }
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
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingBanner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
