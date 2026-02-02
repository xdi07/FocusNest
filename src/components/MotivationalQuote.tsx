import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const quotes = [
  { text: "Your focus determines your reality.", author: "George Lucas" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "You're doing amazing! Keep going.", author: "Your Coach" },
  { text: "Every moment of focus is a victory.", author: "Unknown" },
  { text: "Be kind to your mind.", author: "Your Coach" },
  { text: "You're building a better you, one session at a time.", author: "Your Coach" },
];

const MotivationalQuote = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50 relative overflow-hidden"
    >
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-5 h-5 text-warning" />
        </motion.div>
      </div>
      <p className="text-foreground font-medium text-base leading-relaxed pr-8">
        "{quote.text}"
      </p>
      <p className="text-sm text-muted-foreground mt-2 font-medium">
        — {quote.author}
      </p>
    </motion.div>
  );
};

export default MotivationalQuote;
