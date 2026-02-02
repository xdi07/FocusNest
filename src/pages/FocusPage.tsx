import { motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FocusTimer from "@/components/FocusTimer";
import BreakSuggestion from "@/components/BreakSuggestion";
import { useState } from "react";
import { toast } from "sonner";

const focusModes = [
  { label: "Quick", minutes: 10 },
  { label: "Focus", minutes: 25 },
  { label: "Deep", minutes: 50 },
  { label: "Custom", minutes: 0 },
];

const FocusPage = () => {
  const [selectedMode, setSelectedMode] = useState(1);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);

  const handleSessionComplete = () => {
    setShowBreakSuggestion(true);
    toast.success("Amazing! You completed a focus session! 🎉");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 glass border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Focus Mode</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-secondary-foreground" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-md mx-auto space-y-8">
        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          {focusModes.map((mode, index) => (
            <motion.button
              key={mode.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMode(index)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedMode === index
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {mode.label}
              {mode.minutes > 0 && (
                <span className="ml-1 opacity-70">{mode.minutes}m</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Timer */}
        <FocusTimer
          initialMinutes={focusModes[selectedMode].minutes || 25}
          breakMinutes={5}
          onComplete={handleSessionComplete}
        />

        {/* Break Suggestions */}
        {showBreakSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BreakSuggestion
              onSelect={(title) => {
                toast.info(`Starting ${title}...`);
                setShowBreakSuggestion(false);
              }}
            />
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <h3 className="text-sm font-bold text-foreground mb-2">💡 Focus Tip</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Put your phone face-down during focus sessions. This simple trick reduces the urge to check notifications by 70%!
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default FocusPage;
