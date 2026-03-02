import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mountain,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsCallerAdmin } from "@/hooks/useQueries";
import { storeSessionParameter } from "@/utils/urlParams";
import { useQueryClient } from "@tanstack/react-query";

type SetupStep = "login" | "token" | "success";

export function AdminSetupPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    refetch: refetchAdmin,
  } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const { actor } = useActor();

  const [step, setStep] = useState<SetupStep>("login");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advance to token step when logged in
  useEffect(() => {
    if (identity && step === "login") {
      setStep("token");
    }
  }, [identity, step]);

  // Redirect if already admin
  useEffect(() => {
    if (isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [isAdmin, navigate]);

  const handleClaimAdmin = async () => {
    if (!token.trim() || !actor) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Store the token so the actor picks it up on future page loads
      storeSessionParameter("caffeineAdminToken", token.trim());

      // Directly call _initializeAccessControlWithSecret on the current actor
      // This is the key fix: we don't need to rebuild the actor, we just call the init
      // function with the real token on the already-authenticated actor
      await actor._initializeAccessControlWithSecret(token.trim());

      // Now check if we're admin
      const result = await refetchAdmin();

      if (result.data === true) {
        setStep("success");
        // Invalidate all queries so admin data loads fresh
        await queryClient.invalidateQueries();
        setTimeout(() => {
          navigate({ to: "/admin" });
        }, 1500);
      } else {
        setError(
          "Invalid token or setup failed. Double-check your token and try again.",
        );
      }
    } catch (err) {
      console.error("Admin setup error:", err);
      setError(
        "Invalid token or setup failed. Double-check your token and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isAdminLoading;

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background geometry */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-sidebar-primary/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sidebar-border/20" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-sidebar-primary/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center gap-3 mb-8"
        >
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
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-sidebar-accent/40 rounded-2xl border border-sidebar-border p-7 space-y-6 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {/* ── Step: Already admin ── */}
            {isAdmin && (
              <motion.div
                key="already-admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="w-14 h-14 bg-sidebar-primary/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-sidebar-primary" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">
                    You're already an admin
                  </h1>
                  <p className="text-sidebar-foreground/55 text-sm leading-relaxed">
                    Your account has full admin access to the store.
                  </p>
                </div>
                <Link to="/admin">
                  <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2 h-11 font-semibold">
                    Go to Admin Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* ── Step: Loading ── */}
            {!isAdmin && isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-sidebar-primary/20 animate-ping" />
                  <div className="relative w-14 h-14 bg-sidebar-primary rounded-2xl flex items-center justify-center shadow-xl">
                    <Mountain className="w-8 h-8 text-sidebar-primary-foreground" />
                  </div>
                </div>
                <p className="text-sidebar-foreground/45 text-sm">
                  Checking status…
                </p>
              </motion.div>
            )}

            {/* ── Step 1: Login ── */}
            {!isAdmin && !isLoading && step === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="w-14 h-14 bg-sidebar-primary/15 rounded-2xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-sidebar-primary" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">
                    Set up your admin account
                  </h1>
                  <p className="text-sidebar-foreground/55 text-sm leading-relaxed">
                    First, log in with Internet Identity to verify your
                    identity.
                  </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                  <div className="flex-1 h-px bg-sidebar-border" />
                  <div className="w-2 h-2 rounded-full bg-sidebar-border" />
                </div>
                <p className="text-xs text-sidebar-foreground/40 -mt-2">
                  Step 1 of 2 — Log in
                </p>

                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2 h-11 font-semibold"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-sidebar-primary-foreground/30 border-t-sidebar-primary-foreground rounded-full animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Log in with Internet Identity
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── Step 2: Enter token ── */}
            {!isAdmin && !isLoading && step === "token" && (
              <motion.div
                key="token"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="w-14 h-14 bg-sidebar-primary/15 rounded-2xl flex items-center justify-center">
                  <Mountain className="w-7 h-7 text-sidebar-primary" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">
                    Claim your admin account
                  </h1>
                  <p className="text-sidebar-foreground/55 text-sm leading-relaxed">
                    Enter your admin secret token to complete setup. This was
                    provided when the store was created.
                  </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                  <div className="flex-1 h-px bg-sidebar-primary" />
                  <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                </div>
                <p className="text-xs text-sidebar-foreground/40 -mt-2">
                  Step 2 of 2 — Enter token
                </p>

                <div className="space-y-2">
                  <Label
                    htmlFor="admin-token"
                    className="text-sm font-medium text-sidebar-foreground/80"
                  >
                    Admin Secret Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-token"
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && token.trim()) {
                          handleClaimAdmin();
                        }
                      }}
                      placeholder="Paste your secret token here"
                      className="bg-sidebar-accent/60 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:ring-sidebar-primary pr-10 h-11"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
                      aria-label={showToken ? "Hide token" : "Show token"}
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"
                    >
                      <p className="text-sm text-destructive leading-relaxed">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleClaimAdmin}
                  disabled={!token.trim() || isSubmitting}
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2 h-11 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-sidebar-primary-foreground/30 border-t-sidebar-primary-foreground rounded-full animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Claim Admin Account
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* ── Step 3: Success ── */}
            {!isAdmin && step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center py-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </motion.div>
                <div className="space-y-1.5">
                  <h1 className="font-heading font-bold text-xl text-sidebar-foreground tracking-tight">
                    Admin account created!
                  </h1>
                  <p className="text-sidebar-foreground/55 text-sm leading-relaxed">
                    Redirecting to your dashboard…
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-0.5 bg-sidebar-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to store link */}
        {step !== "success" && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Store
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
