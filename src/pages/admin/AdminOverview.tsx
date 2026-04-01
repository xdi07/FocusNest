import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Shield, Clock, TrendingUp, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminOverview = () => {
  const [counts, setCounts] = useState({ users: 0, logins: 0, sessions: 0, totalMinutes: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLogins, setRecentLogins] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const [u, l, s, ru, rl, rs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("login_attempts").select("id", { count: "exact", head: true }),
        supabase.from("focus_sessions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("focus_sessions").select("*").order("created_at", { ascending: false }).limit(8),
      ]);

      const totalMins = rs.data?.reduce((a: number, s: any) => a + (s.duration || 0), 0) || 0;

      setCounts({ users: u.count ?? 0, logins: l.count ?? 0, sessions: s.count ?? 0, totalMinutes: totalMins });
      setRecentUsers(ru.data || []);
      setRecentLogins(rl.data || []);
      setRecentSessions(rs.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getRelativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: "Total Users", value: counts.users, icon: Users, color: "text-primary" },
    { label: "Login Attempts", value: counts.logins, icon: Shield, color: "text-destructive" },
    { label: "Focus Sessions", value: counts.sessions, icon: Activity, color: "text-primary" },
    { label: "Total Focus Min", value: counts.totalMinutes.toLocaleString(), icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-5 border border-border/50">
            <stat.icon className={`w-7 h-7 mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> New Users
          </h3>
          <div className="space-y-2">
            {recentUsers.map((u: any) => (
              <div
                key={u.id}
                onClick={() => navigate(`/admin/users/${u.id}`)}
                className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.display_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{getRelativeTime(u.created_at)}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${u.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Logins */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Recent Logins
          </h3>
          <div className="space-y-2">
            {recentLogins.map((l: any) => (
              <div key={l.id} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                {l.success ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                )}
                <span className="text-sm text-foreground truncate flex-1">{l.email}</span>
                <span className="text-xs text-muted-foreground shrink-0">{getRelativeTime(l.created_at)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Sessions
          </h3>
          <div className="space-y-2">
            {recentSessions.map((s: any) => (
              <div key={s.id} className="flex items-center gap-2 py-2 border-b border-border/30 last:border-0">
                <span className="text-sm font-medium text-foreground">{s.duration}m</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${s.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                  {s.completed ? "Done" : "—"}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{getRelativeTime(s.created_at)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
