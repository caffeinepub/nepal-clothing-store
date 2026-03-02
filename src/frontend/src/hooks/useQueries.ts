import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type {
  Banner,
  Category,
  CustomerInfo,
  DiscountCode,
  Order,
  OrderItem,
  Product,
  UserProfile,
  UserRole,
} from "../backend.d";
import { DiscountType, OrderStatus, PaymentMethod } from "../backend.d";
import { useActor } from "./useActor";

export { PaymentMethod, OrderStatus, DiscountType };

// ========================
// Auth / User
// ========================

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ========================
// Products
// ========================

export function useProducts(
  filterCategory?: bigint | null,
  filterGender?: string | null,
  filterMinPrice?: number | null,
  filterMaxPrice?: number | null,
  searchTerm?: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: [
      "products",
      filterCategory?.toString(),
      filterGender,
      filterMinPrice,
      filterMaxPrice,
      searchTerm,
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(
        filterCategory ?? null,
        filterGender ?? null,
        filterMinPrice ?? null,
        filterMaxPrice ?? null,
        searchTerm ?? null,
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductById(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProductById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      discountedPrice: number | null;
      category: bigint;
      sizes: string[];
      colors: string[];
      gender: string;
      images: ExternalBlob[];
      stock: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProduct(
        data.name,
        data.description,
        data.price,
        data.discountedPrice,
        data.category,
        data.sizes,
        data.colors,
        data.gender,
        data.images,
        data.stock,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      price: number;
      discountedPrice: number | null;
      category: bigint;
      sizes: string[];
      colors: string[];
      gender: string;
      images: ExternalBlob[];
      stock: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(
        data.id,
        data.name,
        data.description,
        data.price,
        data.discountedPrice,
        data.category,
        data.sizes,
        data.colors,
        data.gender,
        data.images,
        data.stock,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", vars.id.toString()] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ========================
// Categories
// ========================

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: { name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCategory(name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCategory(id, name, description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCategory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ========================
// Orders
// ========================

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders(options?: { refetchInterval?: number }) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: options?.refetchInterval,
  });
}

export function useOrderById(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Order | null>({
    queryKey: ["order", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getOrderById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      items: OrderItem[];
      customerInfo: CustomerInfo;
      paymentMethod: PaymentMethod;
      discountApplied: number | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(
        data.items,
        data.customerInfo,
        data.paymentMethod,
        data.discountApplied,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ========================
// Banners
// ========================

export function useActiveBanners() {
  const { actor, isFetching } = useActor();
  return useQuery<Banner[]>({
    queryKey: ["activeBanners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveBanners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllBanners() {
  const { actor, isFetching } = useActor();
  return useQuery<Banner[]>({
    queryKey: ["allBanners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBanners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      imageRef: ExternalBlob;
      linkUrl: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBanner(
        data.title,
        data.imageRef,
        data.linkUrl,
        data.displayOrder,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeBanners"] });
      qc.invalidateQueries({ queryKey: ["allBanners"] });
    },
  });
}

export function useUpdateBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      imageRef: ExternalBlob;
      linkUrl: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBanner(
        data.id,
        data.title,
        data.imageRef,
        data.linkUrl,
        data.displayOrder,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeBanners"] });
      qc.invalidateQueries({ queryKey: ["allBanners"] });
    },
  });
}

export function useDeleteBanner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteBanner(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeBanners"] });
      qc.invalidateQueries({ queryKey: ["allBanners"] });
    },
  });
}

// ========================
// Discount Codes
// ========================

export function useDiscountCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<DiscountCode[]>({
    queryKey: ["discountCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDiscountCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useValidateDiscountCode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.validateDiscountCode(code);
    },
  });
}

export function useCreateDiscountCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      code: string;
      discountType: DiscountType;
      value: number;
      minOrderAmount: number | null;
      maxUses: bigint | null;
      expiresAt: bigint | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createDiscountCode(
        data.code,
        data.discountType,
        data.value,
        data.minOrderAmount,
        data.maxUses,
        data.expiresAt,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discountCodes"] }),
  });
}

export function useUpdateDiscountCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      code: string;
      discountType: DiscountType;
      value: number;
      minOrderAmount: number | null;
      maxUses: bigint | null;
      expiresAt: bigint | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDiscountCode(
        data.id,
        data.code,
        data.discountType,
        data.value,
        data.minOrderAmount,
        data.maxUses,
        data.expiresAt,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discountCodes"] }),
  });
}

export function useDeleteDiscountCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteDiscountCode(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discountCodes"] }),
  });
}

// ========================
// Profile
// ========================

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}
