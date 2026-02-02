import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, Calendar, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";

const challenges = [
  {
    id: 1,
    title: "7-Day Digital Detox",
    description: "Reduce screen time by 30% for a week",
    duration: "7 days",
    progress: 71,
    daysComplete: 5,
    reward: 100,
    active: true,
  },
  {
    id: 2,
    title: "Focus Master",
    description: "Complete 10 focus sessions",
    duration: "No limit",
    progress: 60,
    daysComplete: 6,
    reward: 50,
    active: true,
  },
  {
    id: 3,
    title: "30-Day Challenge",
    description: "Stay under your daily goal for 30 days",
    duration: "30 days",
    progress: 0,
    daysComplete: 0,
    reward: 500,
    active: false,
  },
];

const dailyGoals = [
  { id: 1, title: "Complete 2 focus sessions", completed: true },
  { id: 2, title: "Stay under 4 hours screen time", completed: true },
  { id: 3, title: "Take 3 healthy breaks", completed: false },
  { id: 4, title: "No phone after 10 PM", completed: false },
];

const GoalsPage = () => {
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
          <h1 className="text-lg font-bold text-foreground">Goals & Challenges</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Daily Goals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Today's Goals</h2>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 space-y-3">
            {dailyGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    goal.completed
                      ? "gradient-success"
                      : "bg-secondary border-2 border-border"
                  }`}
                >
                  {goal.completed && (
                    <CheckCircle2 className="w-4 h-4 text-success-foreground" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    goal.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {goal.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Active Challenges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-warning" />
            <h2 className="text-base font-bold text-foreground">Challenges</h2>
          </div>
          <div className="space-y-3">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`bg-card rounded-2xl p-5 shadow-card border transition-all ${
                  challenge.active
                    ? "border-primary/30"
                    : "border-border/50 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{challenge.title}</h3>
                      {challenge.active && (
                        <span className="px-2 py-0.5 text-xs font-semibold gradient-primary text-primary-foreground rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Reward</p>
                    <p className="font-bold text-warning">🏆 {challenge.reward}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {challenge.duration}
                    </span>
                    <span className="font-semibold text-foreground">
                      {challenge.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={challenge.progress} 
                    className="h-2 [&>div]:gradient-success"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Start New Challenge CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-colors"
        >
          + Start a New Challenge
        </motion.button>
      </main>

      <BottomNav />
    </div>
  );
};

export default GoalsPage;
