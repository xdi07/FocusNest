import { Eye, Droplets, StretchHorizontal, Wind } from "lucide-react";
import { motion } from "framer-motion";

const suggestions = [
  {
    icon: Eye,
    title: "Eye Rest",
    description: "Look at something 20ft away for 20 seconds",
    duration: "20 sec",
  },
  {
    icon: StretchHorizontal,
    title: "Stretch",
    description: "Stand up and stretch your arms and back",
    duration: "1 min",
  },
  {
    icon: Droplets,
    title: "Hydrate",
    description: "Drink a glass of water",
    duration: "30 sec",
  },
  {
    icon: Wind,
    title: "Breathe",
    description: "Take 5 deep breaths to reset",
    duration: "1 min",
  },
];

interface BreakSuggestionProps {
  onSelect?: (title: string) => void;
}

const BreakSuggestion = ({ onSelect }: BreakSuggestionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-foreground">Take a Healthy Break</h3>
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={suggestion.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect?.(suggestion.title)}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground text-sm">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {suggestion.description}
              </p>
              <p className="text-xs font-semibold text-primary mt-2">{suggestion.duration}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BreakSuggestion;
