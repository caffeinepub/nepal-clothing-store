import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCategories,
  useCreateProduct,
  useProductById,
  useUpdateProduct,
} from "@/hooks/useQueries";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";

const GENDERS = ["Men", "Women", "Kids", "Unisex"];
const COMMON_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "2-3Y",
  "4-5Y",
  "6-7Y",
  "8-9Y",
  "Free Size",
  "One Size",
];

interface FormData {
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  categoryId: string;
  sizes: string[];
  colors: string[];
  gender: string;
  stock: string;
  imageUrls: string[];
}

export function AdminProductFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const id = params.id;

  const { data: product, isLoading: productLoading } = useProductById(
    mode === "edit" && id ? BigInt(id) : undefined,
  );
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    categoryId: "",
    sizes: [],
    colors: [],
    gender: "Men",
    stock: "0",
    imageUrls: [],
  });

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && mode === "edit") {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountedPrice: product.discountedPrice?.toString() ?? "",
        categoryId: product.category.toString(),
        sizes: product.sizes,
        colors: product.colors,
        gender: product.gender,
        stock: Number(product.stock).toString(),
        imageUrls: product.images.map((img) => img.getDirectURL()),
      });
    }
  }, [product, mode]);

  const addSize = (size: string) => {
    if (size && !form.sizes.includes(size)) {
      setForm((f) => ({ ...f, sizes: [...f.sizes, size] }));
    }
    setSizeInput("");
  };

  const removeSize = (size: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== size) }));

  const addColor = () => {
    if (colorInput && !form.colors.includes(colorInput)) {
      setForm((f) => ({ ...f, colors: [...f.colors, colorInput] }));
      setColorInput("");
    }
  };

  const removeColor = (color: string) =>
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c !== color) }));

  const addImageUrl = () => {
    if (imageUrlInput && !form.imageUrls.includes(imageUrlInput)) {
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, imageUrlInput] }));
      setImageUrlInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, objectUrl] }));
    toast.info("Image preview added. It will be uploaded when you save.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.categoryId || !form.gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    const images: ExternalBlob[] = form.imageUrls.map((url) =>
      ExternalBlob.fromURL(url),
    );

    const data = {
      name: form.name,
      description: form.description,
      price: Number.parseFloat(form.price),
      discountedPrice: form.discountedPrice
        ? Number.parseFloat(form.discountedPrice)
        : null,
      category: BigInt(form.categoryId),
      sizes: form.sizes,
      colors: form.colors,
      gender: form.gender,
      images,
      stock: BigInt(Number.parseInt(form.stock) || 0),
    };

    try {
      if (mode === "create") {
        await createProduct.mutateAsync(data);
        toast.success("Product created successfully");
      } else if (id) {
        await updateProduct.mutateAsync({ ...data, id: BigInt(id) });
        toast.success("Product updated successfully");
      }
      void navigate({ to: "/admin/products" });
    } catch {
      toast.error(`Failed to ${mode} product`);
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  if (mode === "edit" && productLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void navigate({ to: "/admin/products" })}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mode === "create"
              ? "Create a new product listing"
              : `Editing: ${product?.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-border shadow-admin-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading font-semibold text-foreground">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium mb-1.5 block"
              >
                Product Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. Traditional Kurta Suruwal Set"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label
                htmlFor="desc"
                className="text-sm font-medium mb-1.5 block"
              >
                Description
              </Label>
              <Textarea
                id="desc"
                placeholder="Describe the product..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="price"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Price (NPR) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="2500"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="discount-price"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Discounted Price (NPR)
                </Label>
                <Input
                  id="discount-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="2000 (optional)"
                  value={form.discountedPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountedPrice: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Category *
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, categoryId: v }))
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      ?.filter((c) => c.isActive)
                      .map((cat) => (
                        <SelectItem
                          key={cat.id.toString()}
                          value={cat.id.toString()}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="gender"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Gender *
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="stock"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Stock Quantity *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card className="border-border shadow-admin-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading font-semibold text-foreground">
              Sizes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    form.sizes.includes(s) ? removeSize(s) : addSize(s)
                  }
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    form.sizes.includes(s)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Custom size..."
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize(sizeInput);
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSize(sizeInput)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.sizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.sizes.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => removeSize(s)}
                  >
                    {s}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="border-border shadow-admin-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading font-semibold text-foreground">
              Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Deep Red, Navy Blue..."
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColor}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.colors.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => removeColor(c)}
                  >
                    {c}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-border shadow-admin-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading font-semibold text-foreground">
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Image URL (https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
              >
                Add URL
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleFileUpload(e)}
              />
              <span className="text-xs text-muted-foreground">
                JPG, PNG supported
              </span>
            </div>
            {form.imageUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.imageUrls.map((url, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: image index used for deletion
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${i + 1}`}
                      className="w-20 h-24 object-cover rounded-lg border border-border bg-secondary/30"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          imageUrls: f.imageUrls.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : mode === "create" ? (
              "Create Product"
            ) : (
              "Update Product"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: "/admin/products" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
