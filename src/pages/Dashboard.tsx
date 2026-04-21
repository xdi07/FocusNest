import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Sun, Moon, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenTimeCard from "@/components/ScreenTimeCard";
import StreakCard from "@/components/StreakCard";
import QuickActions from "@/components/QuickActions";
import MotivationalQuote from "@/components/MotivationalQuote";
import WeeklyChart from "@/components/WeeklyChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { aggregateUserAnalytics, createEmptyUserAnalytics } from "@/lib/analytics";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile, settings, updateSettings } = useAuth();
  const [analytics, setAnalytics] = useState(() => createEmptyUserAnalytics());
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const loadAnalytics = async () => {
      const [sessionsRes, goalsRes] = await Promise.all([
        supabase.from("focus_sessions").select("created_at, duration, completed").order("created_at", { ascending: false }),
        supabase.from("goals").select("created_at, completed, target_minutes").order("created_at", { ascending: false }),
      ]);

      setAnalytics(
        aggregateUserAnalytics(
          sessionsRes.data || [],
          goalsRes.data || [],
          (settings?.focus_duration ?? 25) * 4,
        ),
      );
    };

    loadAnalytics();
  }, [settings?.focus_duration]);

  const toggleTheme = async () => {
    const newValue = !settings?.dark_mode;
    document.documentElement.classList.toggle("dark", newValue);
    await updateSettings({ dark_mode: newValue });
  };

  const toggleNotifications = async () => {
    const newValue = !settings?.notifications_enabled;
    await updateSettings({ notifications_enabled: newValue });
  };

  const weeklyData = useMemo(() => analytics.weeklyData, [analytics.weeklyData]);

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
            <h1 className="text-xl font-bold text-foreground">FocusNest</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-foreground" />
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              {settings?.dark_mode ? <Sun className="w-5 h-5 text-secondary-foreground" /> : <Moon className="w-5 h-5 text-secondary-foreground" />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleNotifications}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center relative"
            >
              <Bell className="w-5 h-5 text-secondary-foreground" />
              {settings?.notifications_enabled && <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Quick Start</h2>
          <QuickActions />
        </section>
        <ScreenTimeCard currentTime={analytics.todayMinutes} goalTime={analytics.dailyGoalMinutes} />
        <StreakCard currentStreak={analytics.currentStreak} longestStreak={analytics.longestStreak} />
        <WeeklyChart data={weeklyData} />
        <MotivationalQuote />
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
