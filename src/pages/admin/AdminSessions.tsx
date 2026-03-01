import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

const AdminSessions = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("focus_sessions").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      if (data) setSessions(data as FocusSession[]);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Focus Sessions ({sessions.length})</h2>
      <div className="space-y-2">
        {sessions.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{s.duration} min session</p>
              <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${s.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
              {s.completed ? "Completed" : "Incomplete"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminSessions;
