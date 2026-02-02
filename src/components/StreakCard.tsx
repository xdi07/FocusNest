import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakCard = ({ currentStreak, longestStreak }: StreakCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center shadow-glow"
          >
            <Flame className="w-7 h-7 text-accent-foreground" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-medium">Best</p>
          <p className="text-lg font-bold text-success">{longestStreak} days</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCard;
