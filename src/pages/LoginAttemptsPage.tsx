import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  user_agent: string | null;
  created_at: string;
}

const LoginAttemptsPage = () => {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      const { data } = await supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setAttempts(data as LoginAttempt[]);
      setLoading(false);
    };
    fetchAttempts();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Link to="/profile">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-primary">Login Attempts</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      <div className="max-w-md mx-auto p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground">Recent login & signup attempts</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : attempts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No login attempts yet.</p>
        ) : (
          attempts.map((attempt, i) => (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl bg-card border border-border/50 flex items-start gap-3"
            >
              {attempt.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{attempt.email}</p>
                <p className="text-xs text-muted-foreground">{formatDate(attempt.created_at)}</p>
                {attempt.user_agent && (
                  <p className="text-xs text-muted-foreground/70 mt-1 truncate">{attempt.user_agent}</p>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${attempt.success ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                {attempt.success ? "Success" : "Failed"}
              </span>
            </motion.div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LoginAttemptsPage;
