import { Link } from "@tanstack/react-router";
import { Heart, Mail, MapPin, Mountain, Phone } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Mountain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">
                Pahile<span className="text-accent"> Fashion</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Nepal's premier destination for traditional and contemporary
              fashion. Celebrate every occasion with style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              {(["Men", "Women", "Kids", "Unisex"] as const).map((g) => (
                <li key={g}>
                  <Link
                    to="/products"
                    search={{
                      search: "",
                      gender: g,
                      categoryId: "",
                      minPrice: "",
                      maxPrice: "",
                    }}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {g}'s Collection
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/account", label: "My Account" },
                { href: "/cart", label: "Shopping Cart" },
                { href: "/account", label: "Order History" },
                { href: "/login", label: "Sign In / Register" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span>New Road, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 shrink-0 text-accent" />
                <span>+977 98-XXXXXXXX</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <span>info@pahilefashion.com.np</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-4">
              <p className="text-xs text-primary-foreground/50 mb-2">
                We accept
              </p>
              <div className="flex gap-2">
                {["COD", "eSewa", "Khalti"].map((m) => (
                  <span
                    key={m}
                    className="text-xs px-2 py-1 rounded border border-primary-foreground/20 text-primary-foreground/60"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <p>© {year} Pahile Fashion. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-primary fill-primary" />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
