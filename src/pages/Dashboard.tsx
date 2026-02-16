import { motion } from "framer-motion";
import { Bell, Sun, Moon, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenTimeCard from "@/components/ScreenTimeCard";
import StreakCard from "@/components/StreakCard";
import QuickActions from "@/components/QuickActions";
import MotivationalQuote from "@/components/MotivationalQuote";
import WeeklyChart from "@/components/WeeklyChart";
import { useFaceDetection } from "@/contexts/FaceDetectionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const weeklyData = [
  { day: "Mon", minutes: 180, goal: 240 },
  { day: "Tue", minutes: 220, goal: 240 },
  { day: "Wed", minutes: 150, goal: 240 },
  { day: "Thu", minutes: 280, goal: 240 },
  { day: "Fri", minutes: 190, goal: 240 },
  { day: "Sat", minutes: 310, goal: 240 },
  { day: "Sun", minutes: 165, goal: 240 },
];

const Dashboard = () => {
  const { isChild, isCameraActive } = useFaceDetection();
  const { profile, settings, updateSettings } = useAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const toggleTheme = async () => {
    const newValue = !settings?.dark_mode;
    document.documentElement.classList.toggle("dark", newValue);
    await updateSettings({ dark_mode: newValue });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{greeting}, {profile?.display_name || "Explorer"}!</p>
            <h1 className="text-xl font-bold text-foreground">Ready to focus?</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isCameraActive ? (isChild ? "bg-warning/20" : "bg-success/20") : "bg-secondary"
                }`}
              >
                {isCameraActive ? (
                  isChild ? <ShieldAlert className="w-5 h-5 text-warning" /> : <ShieldCheck className="w-5 h-5 text-success" />
                ) : (
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                )}
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              {settings?.dark_mode ? <Sun className="w-5 h-5 text-secondary-foreground" /> : <Moon className="w-5 h-5 text-secondary-foreground" />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center relative"
            >
              <Bell className="w-5 h-5 text-secondary-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Start</h2>
          <QuickActions />
        </section>
        <ScreenTimeCard currentTime={165} goalTime={240} />
        <StreakCard currentStreak={7} longestStreak={14} />
        <WeeklyChart data={weeklyData} />
        <MotivationalQuote />
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
