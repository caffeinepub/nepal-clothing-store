import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Mountain,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  User,
  Users,
  X,
} from "lucide-react";

const SIDEBAR_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    showNotification: false,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    showNotification: false,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tag,
    showNotification: false,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    showNotification: true,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
    showNotification: false,
  },
  {
    href: "/admin/banners",
    label: "Banners",
    icon: Image,
    showNotification: false,
  },
  {
    href: "/admin/discounts",
    label: "Discounts",
    icon: Ticket,
    showNotification: false,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    showNotification: false,
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function AdminSidebar({ open, onClose, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const { newOrdersCount } = useAdminNotifications();

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const handleNavClick = () => {
    onClose();
  };

  const sidebarContent = (
    <aside className="h-full w-64 bg-sidebar flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
          <Mountain className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-heading font-bold text-base text-sidebar-foreground tracking-tight leading-tight block">
            Super Games
          </span>
          <p className="text-[11px] text-sidebar-foreground/45 font-medium uppercase tracking-wider leading-tight">
            Admin Panel
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          const hasNotification = link.showNotification && newOrdersCount > 0;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={handleNavClick}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              {/* Active left-accent bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-r-full" />
              )}
              {/* Icon with notification dot */}
              <span className="relative shrink-0">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    active
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                  )}
                />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-sidebar" />
                )}
              </span>
              <span className="flex-1">{link.label}</span>
              {/* Notification count badge */}
              {hasNotification && (
                <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {newOrdersCount > 99 ? "99+" : newOrdersCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <User className="w-4 h-4 text-sidebar-foreground/50" />
          <span>View Storefront</span>
        </Link>
        {identity && (
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            onClick={() => {
              clear();
              onClose();
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — fixed, always visible */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 shadow-2xl">
        {sidebarContent}
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3 shadow-sm">
        <button
          type="button"
          onClick={onToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          aria-label="Toggle sidebar"
          aria-expanded={open}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sidebar-primary rounded-md flex items-center justify-center">
            <Mountain className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-sm text-sidebar-foreground">
            Admin Panel
          </span>
        </div>
        {/* Mobile notification indicator */}
        {newOrdersCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {newOrdersCount} new order{newOrdersCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Mobile overlay backdrop */}
      {open && (
        <div
          role="button"
          tabIndex={-1}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
