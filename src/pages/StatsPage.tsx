import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, Clock, Zap, Trophy, Award, Star, Flame, Target, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import WeeklyChart from "@/components/WeeklyChart";
import AchievementBadge from "@/components/AchievementBadge";

const weeklyData = [
  { day: "Mon", minutes: 180, goal: 240 },
  { day: "Tue", minutes: 220, goal: 240 },
  { day: "Wed", minutes: 150, goal: 240 },
  { day: "Thu", minutes: 280, goal: 240 },
  { day: "Fri", minutes: 190, goal: 240 },
  { day: "Sat", minutes: 310, goal: 240 },
  { day: "Sun", minutes: 165, goal: 240 },
];

const stats = [
  { icon: Clock, label: "Avg Daily", value: "2h 45m", trend: "-15%", positive: true },
  { icon: Zap, label: "Focus Sessions", value: "23", trend: "+8", positive: true },
  { icon: Trophy, label: "Goals Met", value: "5/7", trend: "71%", positive: true },
];

const achievements = [
  { icon: Flame, title: "7-Day Streak", unlocked: true },
  { icon: Star, title: "Early Bird", unlocked: true },
  { icon: Target, title: "Goal Crusher", unlocked: true },
  { icon: Crown, title: "Focus Master", unlocked: false, progress: 60 },
  { icon: Award, title: "Detox Pro", unlocked: false, progress: 30 },
];

const StatsPage = () => {
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
          <h1 className="text-lg font-bold text-foreground">Your Progress</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Weekly Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-success flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">This Week</p>
              <p className="text-2xl font-bold text-foreground">Great Progress! 🎉</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You reduced your screen time by <span className="text-success font-semibold">15%</span> compared to last week. Keep up the amazing work!
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center"
              >
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xs font-semibold mt-1 ${stat.positive ? "text-success" : "text-destructive"}`}>
                  {stat.trend}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Weekly Chart */}
        <WeeklyChart data={weeklyData} />

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-base font-bold text-foreground mb-4">Achievements</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <AchievementBadge
                  icon={achievement.icon}
                  title={achievement.title}
                  unlocked={achievement.unlocked}
                  progress={achievement.progress}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <h3 className="text-sm font-bold text-foreground mb-2">🧠 AI Insight</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're most productive in the <span className="text-primary font-semibold">morning hours</span>. Try scheduling your important study sessions between 9 AM and 12 PM for best focus.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default StatsPage;
