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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DiscountType,
  useCreateDiscountCode,
  useDeleteDiscountCode,
  useDiscountCodes,
  useUpdateDiscountCode,
} from "@/hooks/useQueries";
import { formatNPR } from "@/lib/helpers";
import { Edit, Loader2, Plus, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DiscountCode } from "../../backend.d";

export function AdminDiscountsPage() {
  const { data: discounts, isLoading } = useDiscountCodes();
  const createDiscount = useCreateDiscountCode();
  const updateDiscount = useUpdateDiscountCode();
  const deleteDiscount = useDeleteDiscountCode();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(
    null,
  );
  const [form, setForm] = useState({
    code: "",
    discountType: DiscountType.percentage,
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const openCreate = () => {
    setEditingDiscount(null);
    setForm({
      code: "",
      discountType: DiscountType.percentage,
      value: "",
      minOrderAmount: "",
      maxUses: "",
      expiresAt: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setForm({
      code: discount.code,
      discountType: discount.discountType,
      value: discount.value.toString(),
      minOrderAmount: discount.minOrderAmount?.toString() ?? "",
      maxUses: discount.maxUses ? Number(discount.maxUses).toString() : "",
      expiresAt: discount.expiresAt
        ? new Date(Number(discount.expiresAt / 1_000_000n))
            .toISOString()
            .split("T")[0]
        : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.value) {
      toast.error("Code and value are required");
      return;
    }

    const expiresAtBigInt = form.expiresAt
      ? BigInt(new Date(form.expiresAt).getTime()) * 1_000_000n
      : null;

    const data = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      value: Number.parseFloat(form.value),
      minOrderAmount: form.minOrderAmount
        ? Number.parseFloat(form.minOrderAmount)
        : null,
      maxUses: form.maxUses ? BigInt(Number.parseInt(form.maxUses)) : null,
      expiresAt: expiresAtBigInt,
    };

    try {
      if (editingDiscount) {
        await updateDiscount.mutateAsync({ ...data, id: editingDiscount.id });
        toast.success("Discount code updated");
      } else {
        await createDiscount.mutateAsync(data);
        toast.success("Discount code created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: bigint, code: string) => {
    try {
      await deleteDiscount.mutateAsync(id);
      toast.success(`Code "${code}" deleted`);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const isSubmitting = createDiscount.isPending || updateDiscount.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Discount Codes
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage promotional discount codes
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : discounts && discounts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id.toString()}>
                    <TableCell>
                      <code className="font-mono text-sm font-bold bg-secondary px-2 py-0.5 rounded">
                        {discount.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {discount.discountType}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {discount.discountType === DiscountType.percentage
                        ? `${discount.value}%`
                        : formatNPR(discount.value)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {discount.minOrderAmount
                        ? formatNPR(discount.minOrderAmount)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {Number(discount.usedCount)}
                      {discount.maxUses ? ` / ${Number(discount.maxUses)}` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {discount.expiresAt
                        ? new Date(
                            Number(discount.expiresAt / 1_000_000n),
                          ).toLocaleDateString()
                        : "No expiry"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={discount.isActive ? "default" : "secondary"}
                        className={
                          discount.isActive
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : "text-xs"
                        }
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(discount)}
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
                              <AlertDialogTitle>
                                Delete Discount Code
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete code "{discount.code}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={() =>
                                  void handleDelete(discount.id, discount.code)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No discount codes yet
            </p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingDiscount ? "Edit Discount Code" : "Create Discount Code"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label className="text-sm font-medium mb-1.5 block">Code *</Label>
              <Input
                placeholder="DASHAIN30"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                className="uppercase font-mono"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Discount Type *
              </Label>
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, discountType: v as DiscountType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DiscountType.percentage}>
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value={DiscountType.fixed}>
                    Fixed (NPR)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Value *
              </Label>
              <Input
                type="number"
                min="0"
                placeholder={
                  form.discountType === DiscountType.percentage ? "10" : "500"
                }
                value={form.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Min Order (NPR)
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="1000 (optional)"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Max Uses
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="100 (optional)"
                value={form.maxUses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxUses: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium mb-1.5 block">
                Expiry Date
              </Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
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
              {editingDiscount ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
