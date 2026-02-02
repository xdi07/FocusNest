import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  icon: LucideIcon;
  title: string;
  unlocked: boolean;
  progress?: number;
}

const AchievementBadge = ({ icon: Icon, title, unlocked, progress }: AchievementBadgeProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
          unlocked
            ? "gradient-warm shadow-glow"
            : "bg-muted border-2 border-dashed border-border"
        }`}
      >
        <Icon
          className={`w-7 h-7 ${
            unlocked ? "text-accent-foreground" : "text-muted-foreground"
          }`}
        />
        {!unlocked && progress !== undefined && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-card px-2 py-0.5 rounded-full border border-border">
            <span className="text-[10px] font-bold text-muted-foreground">
              {progress}%
            </span>
          </div>
        )}
      </div>
      <p
        className={`text-xs font-semibold text-center ${
          unlocked ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {title}
      </p>
    </motion.div>
  );
};

export default AchievementBadge;
