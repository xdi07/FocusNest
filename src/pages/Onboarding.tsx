import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Clock, Target, Brain, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    icon: Sparkles,
    title: "Welcome to FocusNest",
    description: "Your friendly companion for building healthy digital habits and improving focus.",
    gradient: "gradient-primary",
  },
  {
    icon: Clock,
    title: "Track Your Time",
    description: "Understand your screen time patterns with simple, visual insights that help you improve.",
    gradient: "gradient-success",
  },
  {
    icon: Target,
    title: "Set Achievable Goals",
    description: "Start with small goals and build up. We celebrate every win with you!",
    gradient: "gradient-warm",
  },
  {
    icon: Brain,
    title: "Focus Without Stress",
    description: "Pomodoro timers, healthy breaks, and gentle reminders. No judgment, just support.",
    gradient: "gradient-focus",
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 max-w-md mx-auto">
      {/* Skip Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex justify-end"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/auth")}
          className="text-muted-foreground font-semibold"
        >
          Skip
        </Button>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`w-32 h-32 rounded-3xl ${slide.gradient} flex items-center justify-center shadow-glow mb-8`}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className="w-16 h-16 text-primary-foreground" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-4"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base text-muted-foreground leading-relaxed max-w-xs"
          >
            {slide.description}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="w-full space-y-6">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 gradient-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="w-14 h-14 rounded-2xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              onClick={nextSlide}
              className="w-full h-14 rounded-2xl gradient-primary text-lg font-bold shadow-glow"
            >
              {currentSlide === slides.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
