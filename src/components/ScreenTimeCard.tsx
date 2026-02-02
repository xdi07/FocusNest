import { Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ScreenTimeCardProps {
  currentTime: number; // in minutes
  goalTime: number; // in minutes
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const ScreenTimeCard = ({ currentTime, goalTime }: ScreenTimeCardProps) => {
  const percentage = Math.min((currentTime / goalTime) * 100, 100);
  const isOverGoal = currentTime > goalTime;
  const remaining = goalTime - currentTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Today's Screen Time</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-foreground">
              {formatTime(currentTime)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatTime(goalTime)} goal
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className={`h-3 ${isOverGoal ? '[&>div]:bg-destructive' : '[&>div]:gradient-primary'}`}
        />
        <p className={`text-sm font-medium ${isOverGoal ? 'text-destructive' : 'text-success'}`}>
          {isOverGoal 
            ? `${formatTime(currentTime - goalTime)} over your goal` 
            : `${formatTime(remaining)} remaining`
          }
        </p>
      </div>
    </motion.div>
  );
};

export default ScreenTimeCard;
