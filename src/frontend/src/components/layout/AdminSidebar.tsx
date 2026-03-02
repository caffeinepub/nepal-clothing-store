import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronRight,
  Image,
  LayoutDashboard,
  LogOut,
  Mountain,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  User,
} from "lucide-react";

const SIDEBAR_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/discounts", label: "Discounts", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
          <Mountain className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <span className="font-heading font-bold text-base text-sidebar-foreground">
            Pahile
          </span>
          <p className="text-xs text-sidebar-foreground/50">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <User className="w-4 h-4" />
          <span>View Storefront</span>
        </Link>
        {identity && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={clear}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
