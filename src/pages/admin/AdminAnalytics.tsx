import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Shield, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [signupData, setSignupData] = useState<{ date: string; count: number }[]>([]);
  const [sessionData, setSessionData] = useState<{ date: string; count: number; minutes: number }[]>([]);
  const [loginData, setLoginData] = useState<{ date: string; success: number; failed: number }[]>([]);
  const [totals, setTotals] = useState({ users: 0, sessions: 0, totalMinutes: 0, completionRate: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [profilesRes, sessionsRes, loginsRes] = await Promise.all([
        supabase.from("profiles").select("created_at"),
        supabase.from("focus_sessions").select("created_at, duration, completed"),
        supabase.from("login_attempts").select("created_at, success"),
      ]);

      // Signup trends (last 30 days)
      const profiles = profilesRes.data || [];
      const signupMap: Record<string, number> = {};
      profiles.forEach((p) => {
        const day = new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        signupMap[day] = (signupMap[day] || 0) + 1;
      });
      setSignupData(Object.entries(signupMap).map(([date, count]) => ({ date, count })).slice(-14));

      // Session trends
      const sessions = sessionsRes.data || [];
      const sessionMap: Record<string, { count: number; minutes: number }> = {};
      let totalMins = 0;
      let completed = 0;
      sessions.forEach((s: any) => {
        const day = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!sessionMap[day]) sessionMap[day] = { count: 0, minutes: 0 };
        sessionMap[day].count += 1;
        sessionMap[day].minutes += s.duration || 0;
        totalMins += s.duration || 0;
        if (s.completed) completed++;
      });
      setSessionData(Object.entries(sessionMap).map(([date, d]) => ({ date, ...d })).slice(-14));

      // Login trends
      const logins = loginsRes.data || [];
      const loginMap: Record<string, { success: number; failed: number }> = {};
      logins.forEach((l: any) => {
        const day = new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!loginMap[day]) loginMap[day] = { success: 0, failed: 0 };
        if (l.success) loginMap[day].success++;
        else loginMap[day].failed++;
      });
      setLoginData(Object.entries(loginMap).map(([date, d]) => ({ date, ...d })).slice(-14));

      setTotals({
        users: profiles.length,
        sessions: sessions.length,
        totalMinutes: totalMins,
        completionRate: sessions.length ? Math.round((completed / sessions.length) * 100) : 0,
      });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: "Total Users", value: totals.users, icon: Users },
    { label: "Total Sessions", value: totals.sessions, icon: Activity },
    { label: "Total Focus Minutes", value: totals.totalMinutes.toLocaleString(), icon: TrendingUp },
    { label: "Completion Rate", value: `${totals.completionRate}%`, icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-5 border border-border/50">
            <s.icon className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Signups</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Focus Minutes / Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border/50 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Login Attempts</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="success" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Success" />
              <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
