import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    city: string;
    name: string;
    address: string;
    phone: string;
}
export interface Category {
    id: CategoryId;
    name: string;
    description: string;
    isActive: boolean;
}
export type Time = bigint;
export interface OrderItem {
    name: string;
    color: string;
    size: string;
    productId: ProductId;
    quantity: bigint;
    price: number;
}
export interface DiscountCode {
    id: DiscountCodeId;
    expiresAt?: Time;
    value: number;
    code: string;
    discountType: DiscountType;
    usedCount: bigint;
    isActive: boolean;
    minOrderAmount?: number;
    maxUses?: bigint;
}
export interface Order {
    id: OrderId;
    customerInfo: CustomerInfo;
    paymentStatus: boolean;
    paymentMethod: PaymentMethod;
    orderStatus: OrderStatus;
    discountApplied?: number;
    createdAt: Time;
    updatedAt: Time;
    totalAmount: number;
    customerId: Principal;
    items: Array<OrderItem>;
}
export type BannerId = bigint;
export interface Banner {
    id: BannerId;
    title: string;
    linkUrl: string;
    displayOrder: bigint;
    isActive: boolean;
    imageRef: ExternalBlob;
}
export type CategoryId = bigint;
export type ProductId = bigint;
export interface CustomerInfo {
    city: string;
    name: string;
    address: string;
    phone: string;
}
export type DiscountCodeId = bigint;
export interface Product {
    id: ProductId;
    name: string;
    createdAt: Time;
    description: string;
    isActive: boolean;
    sizes: Array<string>;
    stock: bigint;
    gender: string;
    category: CategoryId;
    colors: Array<string>;
    price: number;
    discountedPrice?: number;
    images: Array<ExternalBlob>;
}
export type OrderId = bigint;
export enum DiscountType {
    fixed = "fixed",
    percentage = "percentage"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum PaymentMethod {
    cod = "cod",
    esewa = "esewa",
    khalti = "khalti"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBanner(title: string, imageRef: ExternalBlob, linkUrl: string, displayOrder: bigint): Promise<BannerId>;
    createCategory(name: string, description: string): Promise<CategoryId>;
    createDiscountCode(code: string, discountType: DiscountType, value: number, minOrderAmount: number | null, maxUses: bigint | null, expiresAt: Time | null): Promise<DiscountCodeId>;
    createOrder(items: Array<OrderItem>, customerInfo: CustomerInfo, paymentMethod: PaymentMethod, discountApplied: number | null): Promise<OrderId>;
    createProduct(name: string, description: string, price: number, discountedPrice: number | null, category: CategoryId, sizes: Array<string>, colors: Array<string>, gender: string, images: Array<ExternalBlob>, stock: bigint): Promise<ProductId>;
    deleteBanner(id: BannerId): Promise<void>;
    deleteCategory(id: CategoryId): Promise<void>;
    deleteDiscountCode(id: DiscountCodeId): Promise<void>;
    deleteProduct(id: ProductId): Promise<void>;
    getActiveBanners(): Promise<Array<Banner>>;
    getAllBanners(): Promise<Array<Banner>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getCategoryById(id: CategoryId): Promise<Category | null>;
    getDiscountCodes(): Promise<Array<DiscountCode>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrderById(id: OrderId): Promise<Order | null>;
    getProductById(id: ProductId): Promise<Product | null>;
    getProducts(filterCategory: CategoryId | null, filterGender: string | null, filterMinPrice: number | null, filterMaxPrice: number | null, searchTerm: string | null): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBanner(id: BannerId, title: string, imageRef: ExternalBlob, linkUrl: string, displayOrder: bigint): Promise<void>;
    updateCategory(id: CategoryId, name: string, description: string): Promise<void>;
    updateDiscountCode(id: DiscountCodeId, code: string, discountType: DiscountType, value: number, minOrderAmount: number | null, maxUses: bigint | null, expiresAt: Time | null): Promise<void>;
    updateOrderStatus(id: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(id: ProductId, name: string, description: string, price: number, discountedPrice: number | null, category: CategoryId, sizes: Array<string>, colors: Array<string>, gender: string, images: Array<ExternalBlob>, stock: bigint): Promise<void>;
    validateDiscountCode(code: string): Promise<DiscountCode | null>;
}
