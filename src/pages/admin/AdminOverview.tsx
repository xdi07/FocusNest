import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
  const [counts, setCounts] = useState({ users: 0, logins: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [u, l, s] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("login_attempts").select("id", { count: "exact", head: true }),
        supabase.from("focus_sessions").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ users: u.count ?? 0, logins: l.count ?? 0, sessions: s.count ?? 0 });
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total Users", value: counts.users, icon: Users, color: "text-primary" },
    { label: "Login Attempts", value: counts.logins, icon: Shield, color: "text-destructive" },
    { label: "Focus Sessions", value: counts.sessions, icon: Activity, color: "text-primary" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border/50"
          >
            <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
