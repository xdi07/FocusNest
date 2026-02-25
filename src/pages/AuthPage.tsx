import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const logAttempt = async (attemptEmail: string, success: boolean) => {
    try {
      await supabase.from("login_attempts").insert({
        email: attemptEmail,
        success,
        user_agent: navigator.userAgent,
      });
    } catch (err) {
      console.error("Failed to log attempt", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        await logAttempt(email, false);
        toast.error(error.message);
      } else {
        await logAttempt(email, true);
        toast.success("Check your email to verify your account!");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        await logAttempt(email, false);
        toast.error(error.message);
      } else {
        await logAttempt(email, true);
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow mb-6"
      >
        <Brain className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-lg font-bold text-primary mb-1"
      >
        FocusNest
      </motion.h2>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-foreground mb-1"
      >
        {isSignUp ? "Create Account" : "Welcome Back"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-muted-foreground mb-8"
      >
        {isSignUp ? "Start your focus journey" : "Continue your focus journey"}
      </motion.p>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full space-y-4"
      >
        <AnimatePresence mode="wait">
          {isSignUp && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-11 h-14 rounded-2xl bg-card border-border/50 text-base"
                  required={isSignUp}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-14 rounded-2xl bg-card border-border/50 text-base"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-14 rounded-2xl bg-card border-border/50 text-base"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl gradient-primary text-lg font-bold shadow-glow"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              {isSignUp ? "Sign Up" : "Sign In"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Toggle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-sm text-muted-foreground"
      >
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary font-semibold hover:underline"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </motion.p>
    </div>
  );
};

export default AuthPage;
