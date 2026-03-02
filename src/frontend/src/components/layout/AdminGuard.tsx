import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsCallerAdmin } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Mountain, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const { login, isLoggingIn, identity } = useInternetIdentity();

  if (isLoading || isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-5">
          {/* Branded logo mark with pulse ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-sidebar-primary/20 animate-ping" />
            <div className="relative w-16 h-16 bg-sidebar-primary rounded-2xl flex items-center justify-center shadow-xl">
              <Mountain className="w-9 h-9 text-sidebar-primary-foreground" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-heading font-bold text-base text-sidebar-foreground tracking-tight">
              Super Games Admin
            </p>
            <p className="text-sidebar-foreground/45 text-sm">
              {isLoggingIn ? "Logging in…" : "Checking permissions…"}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-40 h-0.5 bg-sidebar-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sidebar-primary rounded-full animate-[shimmer_1.5s_infinite]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, oklch(var(--sidebar-primary)) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
        {/* Decorative background geometry */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sidebar-primary/5" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sidebar-border/30" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-lg">
              <Mountain className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div className="text-left">
              <h2 className="font-heading font-bold text-lg text-sidebar-foreground leading-tight tracking-tight">
                Super Games
              </h2>
              <p className="text-[11px] text-sidebar-foreground/45 uppercase tracking-wider font-medium">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-sidebar-accent/40 rounded-2xl border border-sidebar-border p-7 space-y-5 backdrop-blur-sm">
            {/* Icon */}
            <div className="w-14 h-14 bg-destructive/15 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">
                Admin Access Required
              </h1>
              <p className="text-sidebar-foreground/55 text-sm leading-relaxed">
                This area is restricted to administrators only.
                {!identity
                  ? " Log in to continue."
                  : " Contact the store owner to grant you access."}
              </p>
            </div>

            {!identity ? (
              <>
                <Button
                  onClick={login}
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2 h-11 font-semibold"
                >
                  <Lock className="w-4 h-4" />
                  Login to Admin Panel
                </Button>
                <p className="text-center text-xs text-sidebar-foreground/40">
                  First time?{" "}
                  <Link
                    to="/admin/setup"
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground underline underline-offset-2 transition-colors"
                  >
                    Set up your admin account
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="bg-sidebar-border/40 rounded-xl px-4 py-3">
                  <p className="text-sm text-sidebar-foreground/60">
                    You're logged in but don't have admin privileges.
                  </p>
                </div>
                <p className="text-center text-xs text-sidebar-foreground/40">
                  Store owner?{" "}
                  <Link
                    to="/admin/setup"
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground underline underline-offset-2 transition-colors"
                  >
                    Set up your admin account
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/45 hover:text-sidebar-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
