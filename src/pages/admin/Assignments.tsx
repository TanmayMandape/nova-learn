import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";

const Assignments = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [questions, setQuestions] = useState("");
  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Create Assignment</h1>
      <p className="text-sm text-muted-foreground mb-8">Design assignments for your students</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">New Assignment</h2>
          <form className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title..." className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the assignment..." rows={3} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Questions</label>
              <textarea value={questions} onChange={e => setQuestions(e.target.value)} placeholder="Add questions (one per line)..." rows={5} className={`${inputClass} resize-none`} />
            </div>
            <div className="flex gap-3">
              <GlowButton variant="primary" type="submit"><Plus className="w-4 h-4" /> Create</GlowButton>
              <GlowButton variant="secondary"><Sparkles className="w-4 h-4" /> AI Suggest</GlowButton>
            </div>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Recent Assignments</h2>
          <div className="space-y-3">
            {["Data Structures Quiz 3", "Algorithm Analysis HW", "Binary Trees Practice", "Graph Theory Exam"].map((a, i) => (
              <div key={a} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-sm">{a}</span>
                <span className="text-xs text-muted-foreground">{12 + i * 3} submissions</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Assignments;
