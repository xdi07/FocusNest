import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  minutes: number;
  limit: number;
  onClose: () => void;
}

const BREAK_SECONDS = 5 * 60;

const OveruseLimitModal = ({ open, minutes, limit, onClose }: Props) => {
  const [breakActive, setBreakActive] = useState(false);
  const [remaining, setRemaining] = useState(BREAK_SECONDS);

  useEffect(() => {
    if (!breakActive) return;
    if (remaining <= 0) {
      setBreakActive(false);
      onClose();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [breakActive, remaining, onClose]);

  useEffect(() => {
    if (!open) {
      setBreakActive(false);
      setRemaining(BREAK_SECONDS);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-card p-6"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            {!breakActive ? (
              <>
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 mx-auto shadow-glow">
                  <Coffee className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-center mb-2">
                  Daily limit reached
                </h2>
                <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">
                  You've spent <span className="font-semibold text-foreground">{minutes}m</span> in
                  the app today (limit {limit}m). A short break can do wonders.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="gradient-primary w-full h-11 rounded-xl font-semibold"
                    onClick={() => {
                      setBreakActive(true);
                      setRemaining(BREAK_SECONDS);
                    }}
                  >
                    Take a 5-min break
                  </Button>
                  <Button variant="ghost" className="w-full h-11 rounded-xl" onClick={onClose}>
                    Continue anyway
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 mx-auto rounded-full gradient-primary mb-4 shadow-glow"
                />
                <h2 className="text-lg font-bold text-foreground mb-1">Breathe</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Look away from the screen. Stretch.
                </p>
                <p className="text-3xl font-bold text-primary tabular-nums mb-4">
                  {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                  {String(remaining % 60).padStart(2, "0")}
                </p>
                <Button
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setBreakActive(false);
                    onClose();
                  }}
                >
                  Skip break
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OveruseLimitModal;