import { motion } from "framer-motion";
import { ArrowLeft, Settings, Bell, Moon, Sun, Shield, HelpCircle, LogOut, ChevronRight, User, Edit2, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FaceDetectionControl from "@/components/FaceDetectionControl";
import BlurredContent from "@/components/BlurredContent";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { user, profile, settings, signOut, updateProfile, updateSettings } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updateProfile({ display_name: newName.trim() });
      toast.success("Name updated!");
    }
    setEditingName(false);
  };

  const handleToggleDarkMode = async () => {
    const newValue = !settings?.dark_mode;
    document.documentElement.classList.toggle("dark", newValue);
    await updateSettings({ dark_mode: newValue });
    toast.success(newValue ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleToggleNotifications = async () => {
    const newValue = !settings?.notifications_enabled;
    await updateSettings({ notifications_enabled: newValue });
    toast.success(newValue ? "Notifications enabled" : "Notifications disabled");
  };

  const handleUpdateFocusDuration = async (minutes: number) => {
    await updateSettings({ focus_duration: minutes });
    toast.success(`Focus duration set to ${minutes} minutes`);
    setActiveDialog(null);
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Link to="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
            <User className="w-12 h-12 text-primary-foreground" />
          </motion.div>

          {editingName ? (
            <div className="flex items-center justify-center gap-2 mb-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-[180px] h-9 text-center rounded-xl"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <button onClick={handleSaveName} className="text-success"><Check className="w-5 h-5" /></button>
              <button onClick={() => setEditingName(false)} className="text-destructive"><X className="w-5 h-5" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{profile?.display_name || "Focus Explorer"}</h2>
              <button onClick={() => { setNewName(profile?.display_name || ""); setEditingName(true); }}>
                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground">Focus Explorer since {memberSince}</p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">🏆 350</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </div>
        </motion.div>

        <FaceDetectionControl />

        {/* Premium Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }} className="gradient-focus rounded-2xl p-5 text-center cursor-pointer">
          <p className="text-primary-foreground font-bold text-lg">✨ Upgrade to Premium</p>
          <p className="text-primary-foreground/80 text-sm mt-1">Unlock AI insights, advanced analytics & more</p>
        </motion.div>

        {/* Menu Items */}
        <BlurredContent>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            {/* Notifications */}
            <div className="w-full flex items-center gap-4 p-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Manage reminders</p>
              </div>
              <Switch checked={settings?.notifications_enabled ?? true} onCheckedChange={handleToggleNotifications} />
            </div>

            {/* Appearance */}
            <button onClick={handleToggleDarkMode} className="w-full flex items-center gap-4 p-4 border-b border-border text-left hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                {settings?.dark_mode ? <Sun className="w-5 h-5 text-secondary-foreground" /> : <Moon className="w-5 h-5 text-secondary-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Appearance</p>
                <p className="text-xs text-muted-foreground">{settings?.dark_mode ? "Dark mode" : "Light mode"}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* App Blocking */}
            <button onClick={() => toast.info("App blocking coming soon!")} className="w-full flex items-center gap-4 p-4 border-b border-border text-left hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">App Blocking</p>
                <p className="text-xs text-muted-foreground">Manage blocked apps</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Focus Settings */}
            <button onClick={() => setActiveDialog("focus")} className="w-full flex items-center gap-4 p-4 border-b border-border text-left hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Settings className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Focus Settings</p>
                <p className="text-xs text-muted-foreground">{settings?.focus_duration || 25}min focus / {settings?.break_duration || 5}min break</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Help */}
            <button onClick={() => setActiveDialog("help")} className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Help & Support</p>
                <p className="text-xs text-muted-foreground">FAQs and contact</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </motion.div>
        </BlurredContent>

        {/* Logout */}
        <BlurredContent>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </motion.button>
        </BlurredContent>

        <p className="text-center text-xs text-muted-foreground">FocusNest v1.0.0</p>
      </main>

      {/* Focus Settings Dialog */}
      <Dialog open={activeDialog === "focus"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Focus Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Choose your focus session duration:</p>
            <div className="grid grid-cols-2 gap-3">
              {[15, 25, 45, 60].map((min) => (
                <Button
                  key={min}
                  variant={settings?.focus_duration === min ? "default" : "outline"}
                  className="h-14 rounded-xl text-lg font-bold"
                  onClick={() => handleUpdateFocusDuration(min)}
                >
                  {min}m
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={activeDialog === "help"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-semibold text-foreground text-sm mb-1">How does FocusNest work?</h4>
              <p className="text-xs text-muted-foreground">FocusNest helps you build healthy digital habits with focus timers, screen time tracking, and personalized goals.</p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-semibold text-foreground text-sm mb-1">How do I earn points?</h4>
              <p className="text-xs text-muted-foreground">Complete focus sessions, meet daily goals, and maintain streaks to earn points and unlock achievements.</p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-semibold text-foreground text-sm mb-1">Contact Support</h4>
              <p className="text-xs text-muted-foreground">Email us at support@focusnest.app for any questions.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
