import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUsers(data as UserProfile[]);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Users ({users.length})</h2>
      <div className="space-y-2">
        {users.map((u, i) => (
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
      </div>
    </div>
  );
};

export default AdminUsers;
