import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallerRole } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Mountain, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [{ href: "/" as const, label: "Home" }];

export function Navbar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: role } = useCallerRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="container mx-auto max-w-7xl px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Mountain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground tracking-tight">
              Super<span className="text-primary"> Games</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "nav-link text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-primary active"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/products"
              search={{
                search: "",
                gender: "",
                categoryId: "",
                minPrice: "",
                maxPrice: "",
              }}
              className={cn(
                "nav-link text-sm font-medium transition-colors",
                isActive("/products")
                  ? "text-primary active"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Shop
            </Link>
            {role === "admin" && (
              <Link
                to="/admin"
                className={cn(
                  "nav-link text-sm font-medium transition-colors",
                  location.pathname.startsWith("/admin")
                    ? "text-primary active"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/products"
              search={{
                search: "",
                gender: "",
                categoryId: "",
                minPrice: "",
                maxPrice: "",
              }}
            >
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-0">
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {identity ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/account">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="text-xs"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/products"
              search={{
                search: "",
                gender: "",
                categoryId: "",
                minPrice: "",
                maxPrice: "",
              }}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive("/products")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Shop
            </Link>
            {role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-border">
              {identity ? (
                <div className="space-y-2">
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    My Account
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
