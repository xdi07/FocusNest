import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, CheckCircle2, Plus, Trash2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aggregateUserAnalytics, createEmptyUserAnalytics, formatMinutes } from "@/lib/analytics";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_minutes: number;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("60");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(() => createEmptyUserAnalytics());

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [goalsRes, sessionsRes] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("focus_sessions").select("created_at, duration, completed").order("created_at", { ascending: false }),
    ]);

    if (goalsRes.error) {
      toast.error(goalsRes.error.message);
    } else {
      const fetchedGoals = (goalsRes.data || []) as Goal[];
      setGoals(fetchedGoals);
      setAnalytics(aggregateUserAnalytics(sessionsRes.data || [], fetchedGoals, 240));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const addGoal = async () => {
    if (!user || !newTitle.trim()) return;
    const parsedTarget = Number.parseInt(targetMinutes, 10);
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      target_minutes: Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : 60,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Goal added!");
      setNewTitle("");
      setNewDescription("");
      setTargetMinutes("60");
      setShowAddDialog(false);
      await fetchGoals();
    }
  };

  const toggleGoal = async (goal: Goal) => {
    const { error } = await supabase.from("goals").update({ completed: !goal.completed }).eq("id", goal.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await fetchGoals();
    toast.success(goal.completed ? "Goal reopened" : "Goal completed! 🎉");
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await fetchGoals();
    toast.success("Goal removed");
  };

  const goalSummary = useMemo(() => ({
    completed: goals.filter((goal) => goal.completed).length,
    pending: goals.filter((goal) => !goal.completed).length,
  }), [goals]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Link to="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-secondary-foreground" />
            </motion.div>
          </Link>
          <h1 className="text-lg font-bold text-primary">FocusNest</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{goalSummary.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{goalSummary.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Clock3 className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">{formatMinutes(analytics.totalMinutes)}</p>
            <p className="text-xs text-muted-foreground">Focus Time</p>
          </div>
        </motion.section>

        {/* Your Goals */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Your Goals</h2>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No goals yet. Add your first goal!</p>
            ) : (
              goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <button onClick={() => toggleGoal(goal)}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      goal.completed ? "gradient-success" : "bg-secondary border-2 border-border"
                    }`}>
                      {goal.completed && <CheckCircle2 className="w-4 h-4 text-success-foreground" />}
                    </div>
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${goal.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {goal.title}
                    </span>
                    {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">Target: {formatMinutes(goal.target_minutes)}</p>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Add Goal Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddDialog(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-colors"
        >
          + Add a New Goal
        </motion.button>
      </main>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Goal title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input
              type="number"
              min="5"
              step="5"
              placeholder="Target minutes"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Button onClick={addGoal} className="w-full h-12 rounded-xl gradient-primary font-bold" disabled={!newTitle.trim()}>
              Add Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default GoalsPage;
