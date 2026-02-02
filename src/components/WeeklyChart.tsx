import { motion } from "framer-motion";

interface DayData {
  day: string;
  minutes: number;
  goal: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const maxMinutes = Math.max(...data.map((d) => Math.max(d.minutes, d.goal)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
    >
      <h3 className="text-base font-bold text-foreground mb-4">This Week</h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day, index) => {
          const height = (day.minutes / maxMinutes) * 100;
          const isUnderGoal = day.minutes <= day.goal;
          const isToday = index === data.length - 1;

          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                className={`w-full max-w-8 rounded-t-lg ${
                  isUnderGoal ? "gradient-success" : "gradient-warm"
                } ${isToday ? "shadow-glow" : ""}`}
              />
              <span
                className={`text-xs font-semibold ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full gradient-success" />
          <span className="text-xs text-muted-foreground">Under goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full gradient-warm" />
          <span className="text-xs text-muted-foreground">Over goal</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyChart;
