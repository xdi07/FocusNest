import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  user_agent: string | null;
  created_at: string;
}

const AdminLogins = () => {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      if (data) setAttempts(data as LoginAttempt[]);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Login Attempts ({attempts.length})</h2>
      <div className="space-y-2">
        {attempts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-3">
            {a.success ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.email}</p>
              <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
              {a.user_agent && <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{a.user_agent}</p>}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${a.success ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
              {a.success ? "OK" : "Failed"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminLogins;
