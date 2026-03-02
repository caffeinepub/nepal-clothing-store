import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Footer } from "@/components/layout/Footer";
// Layouts
import { Navbar } from "@/components/layout/Navbar";

import { AccountPage } from "@/pages/storefront/AccountPage";
import { CartPage } from "@/pages/storefront/CartPage";
import { CheckoutPage } from "@/pages/storefront/CheckoutPage";
// Storefront pages
import { HomePage } from "@/pages/storefront/HomePage";
import { LoginPage } from "@/pages/storefront/LoginPage";
import { OrderConfirmationPage } from "@/pages/storefront/OrderConfirmationPage";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { ProductsPage } from "@/pages/storefront/ProductsPage";

import { AdminBannersPage } from "@/pages/admin/AdminBannersPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
// Admin pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminDiscountsPage } from "@/pages/admin/AdminDiscountsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

// ========================
// Root Route
// ========================
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ========================
// Storefront Layout
// ========================
const storefrontLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "storefront",
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  ),
});

// ========================
// Admin Layout
// ========================
const adminLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  component: () => (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  ),
});

// ========================
// Storefront Routes
// ========================
const homeRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/",
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/products",
  validateSearch: (search: Record<string, unknown>) => ({
    search: (search.search as string) ?? "",
    gender: (search.gender as string) ?? "",
    categoryId: (search.categoryId as string) ?? "",
    minPrice: (search.minPrice as string) ?? "",
    maxPrice: (search.maxPrice as string) ?? "",
  }),
  component: ProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/products/$id",
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/checkout",
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/order-confirmation/$id",
  component: OrderConfirmationPage,
});

const accountRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/account",
  component: AccountPage,
});

const loginRoute = createRoute({
  getParentRoute: () => storefrontLayout,
  path: "/login",
  component: LoginPage,
});

// ========================
// Admin Routes
// ========================
const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin",
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/products",
  component: AdminProductsPage,
});

const adminProductNewRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/products/new",
  component: () => <AdminProductFormPage mode="create" />,
});

const adminProductEditRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/products/$id/edit",
  component: () => <AdminProductFormPage mode="edit" />,
});

const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/categories",
  component: AdminCategoriesPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/orders",
  component: AdminOrdersPage,
});

const adminBannersRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/banners",
  component: AdminBannersPage,
});

const adminDiscountsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/discounts",
  component: AdminDiscountsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

// ========================
// Router
// ========================
const routeTree = rootRoute.addChildren([
  storefrontLayout.addChildren([
    homeRoute,
    productsRoute,
    productDetailRoute,
    cartRoute,
    checkoutRoute,
    orderConfirmationRoute,
    accountRoute,
    loginRoute,
  ]),
  adminLayout.addChildren([
    adminIndexRoute,
    adminProductsRoute,
    adminProductNewRoute,
    adminProductEditRoute,
    adminCategoriesRoute,
    adminOrdersRoute,
    adminBannersRoute,
    adminDiscountsRoute,
    adminSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
