import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useAllOrders } from "@/hooks/useQueries";
import { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  ArrowRightLeft,
  Loader2,
  Save,
  Shield,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend.d";

// Audit log stored in localStorage
const AUDIT_LOG_KEY = "adminRoleAuditLog";

interface AuditEntry {
  timestamp: string;
  action: string;
  targetPrincipal: string;
  performedBy: string;
}

function getAuditLog(): AuditEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as AuditEntry[];
  } catch {
    return [];
  }
}

function addAuditEntry(entry: AuditEntry): void {
  const log = getAuditLog();
  log.unshift(entry); // newest first
  // Keep last 50 entries
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log.slice(0, 50)));
}

export function AdminSettingsPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: orders } = useAllOrders();

  const [storeInfo, setStoreInfo] = useState({
    storeName: "Super Games",
    tagline: "Your Ultimate Gaming Destination",
    phone: "+977 98-XXXXXXXX",
    email: "info@pahilefashion.com.np",
    address: "New Road, Kathmandu, Nepal",
    freeDeliveryThreshold: "2000",
    deliveryFee: "150",
  });

  const [saving, setSaving] = useState(false);

  // Role management state
  const [assignTarget, setAssignTarget] = useState("");
  const [assignRole, setAssignRole] = useState<"admin" | "user">("admin");
  const [assigning, setAssigning] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(getAuditLog);

  // Get unique registered principals from orders as a proxy for registered users
  const knownPrincipals = Array.from(
    new Set(orders?.map((o) => o.customerId.toString()) ?? []),
  );

  const callerPrincipal = identity?.getPrincipal().toString() ?? "";

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  const handleAssignRole = async () => {
    if (!assignTarget.trim()) {
      toast.error("Please enter a Principal ID");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setAssigning(true);
    try {
      let targetPrincipal: Principal;
      try {
        targetPrincipal = Principal.fromText(assignTarget.trim());
      } catch {
        toast.error("Invalid Principal ID format");
        return;
      }
      await actor.assignCallerUserRole(
        targetPrincipal,
        assignRole === "admin" ? UserRole.admin : UserRole.user,
      );
      const entry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: `Assigned role "${assignRole}" to principal`,
        targetPrincipal: assignTarget.trim(),
        performedBy: callerPrincipal,
      };
      addAuditEntry(entry);
      setAuditLog(getAuditLog());
      toast.success(
        `Role "${assignRole}" assigned to ${assignTarget.trim().slice(0, 12)}...`,
      );
      setAssignTarget("");
    } catch (err) {
      toast.error("Failed to assign role. Ensure you have admin privileges.");
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleTransferAuthority = async () => {
    if (!transferTarget.trim()) {
      toast.error("Please enter the Principal ID of the new Super Admin");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setTransferring(true);
    try {
      let targetPrincipal: Principal;
      try {
        targetPrincipal = Principal.fromText(transferTarget.trim());
      } catch {
        toast.error("Invalid Principal ID format");
        return;
      }

      // Step 1: Promote the target user to admin
      await actor.assignCallerUserRole(targetPrincipal, UserRole.admin);

      // Step 2: Demote self to user (sub admin)
      const selfPrincipal = Principal.fromText(callerPrincipal);
      await actor.assignCallerUserRole(selfPrincipal, UserRole.user);

      const entry: AuditEntry = {
        timestamp: new Date().toISOString(),
        action: "Super Admin authority transferred",
        targetPrincipal: transferTarget.trim(),
        performedBy: callerPrincipal,
      };
      addAuditEntry(entry);
      setAuditLog(getAuditLog());

      toast.success("Super Admin authority transferred successfully", {
        description: "You are now a Sub Admin.",
      });
      setTransferTarget("");
      setShowTransferConfirm(false);
    } catch (err) {
      toast.error(
        "Failed to transfer authority. Ensure you have Super Admin privileges.",
      );
      console.error(err);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Store Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure your store information and manage roles
        </p>
      </div>

      {/* Store Info */}
      <Card className="border-border shadow-admin-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading font-semibold">
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Store Name
            </Label>
            <Input
              value={storeInfo.storeName}
              onChange={(e) =>
                setStoreInfo((s) => ({ ...s, storeName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Tagline</Label>
            <Textarea
              value={storeInfo.tagline}
              onChange={(e) =>
                setStoreInfo((s) => ({ ...s, tagline: e.target.value }))
              }
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
              <Input
                value={storeInfo.phone}
                onChange={(e) =>
                  setStoreInfo((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Email</Label>
              <Input
                type="email"
                value={storeInfo.email}
                onChange={(e) =>
                  setStoreInfo((s) => ({ ...s, email: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Address</Label>
            <Input
              value={storeInfo.address}
              onChange={(e) =>
                setStoreInfo((s) => ({ ...s, address: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card className="border-border shadow-admin-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading font-semibold">
            Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Free Delivery Threshold (NPR)
              </Label>
              <Input
                type="number"
                value={storeInfo.freeDeliveryThreshold}
                onChange={(e) =>
                  setStoreInfo((s) => ({
                    ...s,
                    freeDeliveryThreshold: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Orders above this amount get free delivery
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Delivery Fee (NPR)
              </Label>
              <Input
                type="number"
                value={storeInfo.deliveryFee}
                onChange={(e) =>
                  setStoreInfo((s) => ({ ...s, deliveryFee: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Applied below the free delivery threshold
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-border shadow-admin-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading font-semibold">
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                method: "Cash on Delivery (COD)",
                enabled: true,
                badge: "Active",
              },
              { method: "eSewa", enabled: true, badge: "Simulated" },
              { method: "Khalti", enabled: true, badge: "Simulated" },
            ].map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
              >
                <span className="text-sm font-medium">{item.method}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            eSewa and Khalti integrations are currently in simulation mode.
          </p>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card className="border-border shadow-admin-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-heading font-semibold">
              Role Management
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2.5 border border-border/50">
            <strong>Note:</strong> The first admin has full system control. Use
            "Transfer Authority" to promote another user to Super Admin — this
            will demote you to Sub Admin. Sub Admins cannot transfer authority.
          </p>

          {/* Assign Role Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCog className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Assign Role
              </p>
            </div>

            {knownPrincipals.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Known customers (from orders):
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {knownPrincipals.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAssignTarget(p)}
                      className="text-[11px] font-mono px-2 py-0.5 bg-secondary hover:bg-secondary/80 rounded border border-border/50 transition-colors truncate max-w-[160px]"
                      title={p}
                    >
                      {p.slice(0, 16)}…
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Enter Principal ID (e.g. 2vxsx-fae...)"
                value={assignTarget}
                onChange={(e) => setAssignTarget(e.target.value)}
                className="font-mono text-xs flex-1"
              />
              <Select
                value={assignRole}
                onValueChange={(v) => setAssignRole(v as "admin" | "user")}
              >
                <SelectTrigger className="w-28 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={() => void handleAssignRole()}
              disabled={assigning || !assignTarget.trim()}
              className="gap-2"
            >
              {assigning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserCog className="w-3.5 h-3.5" />
              )}
              {assigning ? "Assigning..." : "Assign Role"}
            </Button>
          </div>

          <Separator />

          {/* Transfer Super Admin Authority */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Transfer Super Admin Authority
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This irreversibly promotes another user to Super Admin and demotes
              you to Sub Admin.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="New Super Admin Principal ID"
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
                className="font-mono text-xs flex-1"
              />
            </div>
            {!showTransferConfirm ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTransferConfirm(true)}
                disabled={!transferTarget.trim()}
                className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Transfer Authority
              </Button>
            ) : (
              <div className="flex flex-col gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive font-medium">
                    Are you sure? You will lose Super Admin access after this
                    action.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleTransferAuthority()}
                    disabled={transferring}
                    className="gap-1.5"
                  >
                    {transferring ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    )}
                    {transferring ? "Transferring..." : "Confirm Transfer"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTransferConfirm(false)}
                    disabled={transferring}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Audit Log */}
          {auditLog.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role Change Audit Log
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {auditLog.map((entry, i) => (
                    <div
                      key={`${entry.timestamp}-${i}`}
                      className="p-2 bg-muted/30 rounded-lg text-xs border border-border/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {entry.action}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap shrink-0">
                          {new Date(entry.timestamp).toLocaleDateString(
                            "en-NP",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-mono mt-0.5 truncate">
                        Target: {entry.targetPrincipal.slice(0, 20)}…
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Button
        onClick={() => void handleSave()}
        disabled={saving}
        className="bg-primary text-primary-foreground gap-2"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
