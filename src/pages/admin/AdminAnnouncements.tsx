import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from("announcements").select("id, title, content, created_at").order("created_at", { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Fill in both fields"); return; }
    setSending(true);
    const { error } = await supabase.from("announcements").insert({ title, content, created_by: user?.id } as any);
    if (error) toast.error(error.message);
    else { toast.success("Announcement posted"); setTitle(""); setContent(""); fetchAnnouncements(); }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Deleted");
    fetchAnnouncements();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Announcements</h2>

      <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4 max-w-xl">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Megaphone className="w-4 h-4" /> New Announcement</h3>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
        <Textarea placeholder="Content..." value={content} onChange={(e) => setContent(e.target.value)} className="rounded-xl min-h-[100px]" />
        <Button onClick={handleSend} disabled={sending} className="rounded-xl">
          <Send className="w-4 h-4 mr-2" />
          {sending ? "Posting..." : "Post Announcement"}
        </Button>
      </div>

      <div className="space-y-2">
        {announcements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-card rounded-2xl p-4 border border-border/50 flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{formatDate(a.created_at)}</p>
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
