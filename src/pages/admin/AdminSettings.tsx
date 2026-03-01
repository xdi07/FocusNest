import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AppSetting {
  key: string;
  value: string;
}

const settingsConfig: { key: string; label: string; type: "text" | "number" | "toggle" }[] = [
  { key: "app_name", label: "App Name", type: "text" },
  { key: "default_focus_duration", label: "Default Focus Duration (min)", type: "number" },
  { key: "default_break_duration", label: "Default Break Duration (min)", type: "number" },
  { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("key, value").then(({ data }) => {
      const map: Record<string, string> = {};
      (data as AppSetting[] || []).forEach((s) => (map[s.key] = s.value));
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() } as any).eq("key", key)
    );
    await Promise.all(updates);
    toast.success("Settings saved");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-foreground">App Settings</h2>

      <div className="space-y-4">
        {settingsConfig.map((cfg, i) => (
          <motion.div key={cfg.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-5 border border-border/50">
            <label className="text-sm font-medium text-foreground mb-2 block">{cfg.label}</label>
            {cfg.type === "toggle" ? (
              <Switch
                checked={settings[cfg.key] === "true"}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, [cfg.key]: String(v) }))}
              />
            ) : (
              <Input
                type={cfg.type}
                value={settings[cfg.key] || ""}
                onChange={(e) => setSettings((s) => ({ ...s, [cfg.key]: e.target.value }))}
                className="rounded-xl"
              />
            )}
          </motion.div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="rounded-xl">
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default AdminSettings;
