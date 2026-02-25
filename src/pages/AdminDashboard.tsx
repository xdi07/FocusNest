import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Target, Shield, LogOut, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  user_agent: string | null;
  created_at: string;
}

interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  completed: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "logins" | "sessions">("users");
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const [usersRes, attemptsRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }),
        supabase.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("focus_sessions").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      if (usersRes.data) setUsers(usersRes.data as UserProfile[]);
      if (attemptsRes.data) setAttempts(attemptsRes.data as LoginAttempt[]);
      if (sessionsRes.data) setSessions(sessionsRes.data as FocusSession[]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
    toast.success("Logged out");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users, count: users.length },
    { key: "logins" as const, label: "Login Attempts", icon: Shield, count: attempts.length },
    { key: "sessions" as const, label: "Focus Sessions", icon: Activity, count: sessions.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">FocusNest</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-destructive font-medium hover:underline">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
            { label: "Login Attempts", value: attempts.length, icon: Shield, color: "text-destructive" },
            { label: "Focus Sessions", value: sessions.length, icon: Activity, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-4 border border-border/50 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === "users" &&
              users.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{u.display_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${u.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    {u.role}
                  </span>
                </motion.div>
              ))}

            {activeTab === "logins" &&
              attempts.map((a, i) => (
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

            {activeTab === "sessions" &&
              sessions.map((s, i) => (
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
