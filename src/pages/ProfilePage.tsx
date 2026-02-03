import { motion } from "framer-motion";
import { ArrowLeft, Settings, Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FaceDetectionControl from "@/components/FaceDetectionControl";
import BlurredContent from "@/components/BlurredContent";

const menuItems = [
  { icon: Bell, label: "Notifications", description: "Manage reminders" },
  { icon: Moon, label: "Appearance", description: "Dark mode & themes" },
  { icon: Shield, label: "App Blocking", description: "Manage blocked apps" },
  { icon: Settings, label: "Focus Settings", description: "Timer preferences" },
  { icon: HelpCircle, label: "Help & Support", description: "FAQs and contact" },
];

const ProfilePage = () => {
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow"
          >
            <User className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">Alex Student</h2>
          <p className="text-sm text-muted-foreground">Focus Explorer since Jan 2025</p>

          {/* Stats Row */}
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

        {/* Face Detection Control */}
        <FaceDetectionControl />

        {/* Premium Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="gradient-focus rounded-2xl p-5 text-center cursor-pointer"
        >
          <p className="text-primary-foreground font-bold text-lg">✨ Upgrade to Premium</p>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Unlock AI insights, advanced analytics & more
          </p>
        </motion.div>

        {/* Menu Items - Protected for children */}
        <BlurredContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                  className="w-full flex items-center gap-4 p-4 text-left border-b border-border last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </motion.div>
        </BlurredContent>

        {/* Logout - Protected for children */}
        <BlurredContent>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </motion.button>
        </BlurredContent>

        <p className="text-center text-xs text-muted-foreground">
          FocusNest v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
