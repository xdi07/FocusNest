import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Clock, Target, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const [p, s, g, st] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("focus_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_settings").select("*").eq("id", userId).single(),
      ]);
      setProfile(p.data);
      setSessions(s.data || []);
      setGoals(g.data || []);
      setSettings(st.data);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const toggleRole = async () => {
    if (!profile) return;
    const newRole = profile.role === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId!);
    setProfile({ ...profile, role: newRole });
    toast.success(`Role changed to ${newRole}`);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <p className="text-muted-foreground">User not found</p>;

  const totalMinutes = sessions.reduce((a: number, s: any) => a + (s.duration || 0), 0);
  const completedSessions = sessions.filter((s: any) => s.completed).length;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border/50 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{profile.display_name || "Unnamed"}</h2>
          <p className="text-sm text-muted-foreground">Joined {formatDate(profile.created_at)}</p>
          {profile.bio && <p className="text-xs text-muted-foreground/80 mt-1">{profile.bio}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${profile.role === "admin" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            {profile.role}
          </span>
          <Button variant="outline" size="sm" onClick={toggleRole} className="rounded-xl text-xs">
            {profile.role === "admin" ? "Demote" : "Promote"}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length, icon: Clock },
          { label: "Completed", value: completedSessions, icon: Shield },
          { label: "Total Minutes", value: totalMinutes, icon: Clock },
          { label: "Goals", value: goals.length, icon: Target },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Settings */}
      {settings && (
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">User Settings</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">Focus:</span> <span className="text-foreground font-medium">{settings.focus_duration}m</span></div>
            <div><span className="text-muted-foreground">Break:</span> <span className="text-foreground font-medium">{settings.break_duration}m</span></div>
            <div><span className="text-muted-foreground">Dark Mode:</span> <span className="text-foreground font-medium">{settings.dark_mode ? "On" : "Off"}</span></div>
            <div><span className="text-muted-foreground">Notifications:</span> <span className="text-foreground font-medium">{settings.notifications_enabled ? "On" : "Off"}</span></div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h3>
        <div className="space-y-2">
          {sessions.slice(0, 10).map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{s.duration}m</span>
              <span className="text-muted-foreground">{formatDate(s.created_at)}</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded ${s.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                {s.completed ? "Done" : "Incomplete"}
              </span>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions</p>}
        </div>
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Goals</h3>
        <div className="space-y-2">
          {goals.map((g: any) => (
            <div key={g.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3 text-sm">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{g.title}</span>
              <span className="text-muted-foreground">{g.target_minutes}m target</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded ${g.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                {g.completed ? "Done" : "Active"}
              </span>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
