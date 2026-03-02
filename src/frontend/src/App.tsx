import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";

import { AdminGuard } from "@/components/layout/AdminGuard";
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
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
// Admin pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminDiscountsPage } from "@/pages/admin/AdminDiscountsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminSetupPage } from "@/pages/admin/AdminSetupPage";

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
// Admin Layout (with mobile sidebar state)
// ========================
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="ml-0 lg:ml-64 min-h-screen">
          {/* Mobile top bar spacer */}
          <div className="h-14 lg:hidden" />
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

const adminLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin",
  component: AdminLayout,
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

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/admin/customers",
  component: AdminCustomersPage,
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
// Standalone Routes (no layout guard)
// ========================
const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/setup",
  component: AdminSetupPage,
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
    adminCustomersRoute,
    adminBannersRoute,
    adminDiscountsRoute,
    adminSettingsRoute,
  ]),
  adminSetupRoute,
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
