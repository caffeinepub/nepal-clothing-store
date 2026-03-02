import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Mountain, ShieldCheck, Zap } from "lucide-react";
import { useEffect } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isLoginSuccess } =
    useInternetIdentity();

  useEffect(() => {
    if (identity || isLoginSuccess) {
      void navigate({ to: "/" });
    }
  }, [identity, isLoginSuccess, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary/50 via-background to-secondary/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-product-hover p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Mountain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">
              Pahile<span className="text-primary"> Fashion</span>
            </span>
          </div>

          <h1 className="font-heading font-bold text-xl text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to access your account, track orders, and enjoy a
            personalized shopping experience.
          </p>

          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-semibold h-12 text-base gap-2"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In / Register"
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Secure & private authentication</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <span>One-click sign in, no password needed</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
