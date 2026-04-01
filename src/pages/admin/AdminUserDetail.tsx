import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Clock, Target, Shield, Calendar,
  TrendingUp, Award, Monitor, CheckCircle, XCircle,
  Flame, BarChart3, Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      const [p, s, g, st] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("focus_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_settings").select("*").eq("id", userId).single(),
      ]);

      // Fetch login history by email from profile
      const profileData = p.data;
      setProfile(profileData);
      setSessions(s.data || []);
      setGoals(g.data || []);
      setSettings(st.data);

      if (profileData) {
        // Get logins by matching user - we'll fetch all and show recent
        const { data: logins } = await supabase
          .from("login_attempts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        // Filter by email pattern if possible
        setLoginHistory(logins || []);
      }

      setLoading(false);
    };
    fetchAll();
  }, [userId]);

  const toggleRole = async () => {
    if (!profile) return;
    const newRole = profile.role === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId!);
    setProfile({ ...profile, role: newRole });
    toast.success(`Role changed to ${newRole}`);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatShortDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getRelativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <p className="text-muted-foreground">User not found</p>;

  const totalMinutes = sessions.reduce((a: number, s: any) => a + (s.duration || 0), 0);
  const completedSessions = sessions.filter((s: any) => s.completed).length;
  const completionRate = sessions.length ? Math.round((completedSessions / sessions.length) * 100) : 0;
  const avgDuration = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;
  const completedGoals = goals.filter((g: any) => g.completed).length;
  const goalCompletionRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

  // Calculate streak (consecutive days with sessions)
  const sessionDays = [...new Set(sessions.map((s: any) => new Date(s.created_at).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sessionDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (sessionDays[i] === expected.toDateString()) streak++;
    else break;
  }

  // Weekly session chart data (last 7 days)
  const weeklyData: { day: string; minutes: number; sessions: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toDateString();
    const daySessions = sessions.filter((s: any) => new Date(s.created_at).toDateString() === dayStr);
    weeklyData.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      minutes: daySessions.reduce((a: number, s: any) => a + (s.duration || 0), 0),
      sessions: daySessions.length,
    });
  }

  // Parse device info from login user agents
  const parseDevice = (ua: string | null) => {
    if (!ua) return "Unknown";
    if (/mobile|android|iphone/i.test(ua)) return "Mobile";
    if (/tablet|ipad/i.test(ua)) return "Tablet";
    return "Desktop";
  };

  const parseBrowser = (ua: string | null) => {
    if (!ua) return "Unknown";
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
    if (/firefox/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
    if (/edg/i.test(ua)) return "Edge";
    return "Other";
  };

  const accountAge = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{profile.display_name || "Unnamed"}</h2>
              <span className={`text-xs font-medium px-3 py-1 rounded-lg ${profile.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">User ID: <span className="font-mono text-xs">{profile.id}</span></p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {formatDate(profile.created_at)}</span>
              <span>{accountAge} days on platform</span>
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground/80 mt-2">{profile.bio}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={toggleRole} className="rounded-xl text-xs shrink-0">
            {profile.role === "admin" ? "Demote to User" : "Promote to Admin"}
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Sessions", value: sessions.length, icon: Clock, color: "text-primary" },
          { label: "Focus Minutes", value: totalMinutes, icon: TrendingUp, color: "text-primary" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Award, color: completionRate >= 70 ? "text-green-500" : "text-amber-500" },
          { label: "Avg Duration", value: `${avgDuration}m`, icon: BarChart3, color: "text-primary" },
          { label: "Current Streak", value: `${streak}d`, icon: Flame, color: streak > 0 ? "text-orange-500" : "text-muted-foreground" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card rounded-2xl p-4 border border-border/50">
            <s.icon className={`w-5 h-5 mb-1.5 ${s.color}`} />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity Chart + Goals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Focus Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">Goals Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Goals</span>
              <span className="text-sm font-bold text-foreground">{goals.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-sm font-bold text-green-500">{completedGoals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="text-sm font-bold text-primary">{goals.length - completedGoals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className={`text-sm font-bold ${goalCompletionRate >= 70 ? "text-green-500" : goalCompletionRate >= 40 ? "text-amber-500" : "text-destructive"}`}>{goalCompletionRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${goalCompletionRate}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Settings */}
      {settings && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" /> User Preferences
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-muted/50 rounded-xl p-3">
              <span className="text-xs text-muted-foreground block">Focus Duration</span>
              <span className="text-foreground font-semibold">{settings.focus_duration} min</span>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <span className="text-xs text-muted-foreground block">Break Duration</span>
              <span className="text-foreground font-semibold">{settings.break_duration} min</span>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <span className="text-xs text-muted-foreground block">Dark Mode</span>
              <span className="text-foreground font-semibold">{settings.dark_mode ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <span className="text-xs text-muted-foreground block">Notifications</span>
              <span className="text-foreground font-semibold">{settings.notifications_enabled ? "On" : "Off"}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Login History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card rounded-2xl p-5 border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Recent Login Activity
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loginHistory.slice(0, 20).map((l: any) => (
            <div key={l.id} className="flex items-center gap-3 text-sm py-2 border-b border-border/30 last:border-0">
              {l.success ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
              <span className="text-foreground font-medium truncate min-w-0 flex-1">{l.email}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  {parseDevice(l.user_agent)} · {parseBrowser(l.user_agent)}
                </span>
                <span className="text-xs text-muted-foreground">{getRelativeTime(l.created_at)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${l.success ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                  {l.success ? "OK" : "Fail"}
                </span>
              </div>
            </div>
          ))}
          {loginHistory.length === 0 && <p className="text-sm text-muted-foreground">No login history</p>}
        </div>
      </motion.div>

      {/* Recent Focus Sessions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Focus Sessions ({sessions.length})
        </h3>
        <div className="space-y-2">
          {sessions.slice(0, 15).map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{s.duration}m</span>
              <span className="text-muted-foreground">{formatDate(s.created_at)}</span>
              <span className="text-xs text-muted-foreground ml-auto">{getRelativeTime(s.created_at)}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${s.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                {s.completed ? "Completed" : "Incomplete"}
              </span>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet</p>}
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Goals ({goals.length})
        </h3>
        <div className="space-y-2">
          {goals.map((g: any) => (
            <div key={g.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3 text-sm">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-foreground font-medium block truncate">{g.title}</span>
                {g.description && <span className="text-xs text-muted-foreground truncate block">{g.description}</span>}
              </div>
              <span className="text-xs text-muted-foreground">{g.target_minutes}m target</span>
              {g.due_date && <span className="text-xs text-muted-foreground">Due {formatShortDate(g.due_date)}</span>}
              <span className={`text-xs px-2 py-0.5 rounded ${g.completed ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}>
                {g.completed ? "Done" : "Active"}
              </span>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet</p>}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUserDetail;
