import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    storeName: "Pahile Fashion",
    tagline: "Nepal's Premier Fashion Destination",
    phone: "+977 98-XXXXXXXX",
    email: "info@pahilefashion.com.np",
    address: "New Road, Kathmandu, Nepal",
    freeDeliveryThreshold: "2000",
    deliveryFee: "150",
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Store Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configure your store information
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
