import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FocusTimerProps {
  initialMinutes?: number;
  breakMinutes?: number;
  onComplete?: () => void;
}

const FocusTimer = ({ 
   initialMinutes = 60, 
  breakMinutes = 5,
  onComplete 
}: FocusTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  const totalTime = isBreak ? breakMinutes * 60 : initialMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
     return `${mins.toString().padStart(2, "0")}.${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(initialMinutes * 60);
    } else {
      setSessions((s) => s + 1);
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
      onComplete?.();
    }
    setIsRunning(false);
  }, [isBreak, initialMinutes, breakMinutes, onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(initialMinutes * 60);
  };

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Timer Circle */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <svg width="300" height="300" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="150"
            cy="150"
            r="140"
            stroke={isBreak ? "hsl(var(--success))" : "hsl(var(--primary))"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isBreak ? "break" : "focus"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-2"
            >
              {isBreak ? (
                <>
                  <Coffee className="w-5 h-5 text-success" />
                  <span className="text-sm font-semibold text-success">Break Time</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">Focus Session</span>
              )}
            </motion.div>
          </AnimatePresence>
          
          <motion.span
            key={timeLeft}
            className="text-6xl font-bold text-foreground tracking-tight"
          >
            {formatTime(timeLeft)}
          </motion.span>

          <p className="text-sm text-muted-foreground mt-2">
            {sessions} sessions completed
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          className="w-14 h-14 rounded-2xl"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-20 h-20 rounded-full text-lg font-bold shadow-glow ${
              isBreak ? "bg-success hover:bg-success/90" : "gradient-primary"
            }`}
          >
            {isRunning ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </motion.div>

        <div className="w-14 h-14" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
};

export default FocusTimer;
