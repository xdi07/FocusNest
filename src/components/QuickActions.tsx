import { Play, Moon, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const actions = [
  { 
    icon: Play, 
    label: "Focus", 
    sublabel: "25 min",
    path: "/focus",
    gradient: "gradient-primary" 
  },
  { 
    icon: Moon, 
    label: "Detox", 
    sublabel: "Challenge",
    path: "/goals",
    gradient: "gradient-focus" 
  },
  { 
    icon: BookOpen, 
    label: "Study", 
    sublabel: "Session",
    path: "/focus",
    gradient: "gradient-success" 
  },
  { 
    icon: Zap, 
    label: "Quick", 
    sublabel: "10 min",
    path: "/focus",
    gradient: "gradient-warm" 
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const QuickActions = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-4 gap-3"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.label} variants={itemVariants}>
            <Link
              to={action.path}
              className="flex flex-col items-center gap-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-2xl ${action.gradient} flex items-center justify-center shadow-soft transition-shadow group-hover:shadow-glow`}
              >
                <Icon className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground">{action.sublabel}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default QuickActions;
