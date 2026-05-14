import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useUsageGuard } from "@/contexts/UsageGuardContext";

const OveruseBanner = () => {
  const { minutes, limit, dismissBanner } = useUsageGuard();
  const over = Math.max(0, minutes - limit);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-0 inset-x-0 z-[60] flex justify-center px-3 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 backdrop-blur-md px-4 py-2.5 shadow-card max-w-md w-full">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
        <div className="flex-1 text-xs sm:text-sm">
          <p className="font-semibold text-foreground leading-tight">
            {over}m over your daily limit
          </p>
          <p className="text-muted-foreground leading-tight">Time to step away from the screen.</p>
        </div>
        <button
          onClick={dismissBanner}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-muted-foreground hover:bg-background/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default OveruseBanner;