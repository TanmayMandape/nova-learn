import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const Assignments = () => {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [questions, setQuestions] = useState<any>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  useEffect(() => {
    apiFetch("/assignments").then(setRecentAssignments).catch(() => {});
  }, []);

  const handleAISuggest = async () => {
    if (!transcript.trim()) { toast.error("Paste a lecture transcript first"); return; }
    setLoadingAI(true);
    try {
      const res = await apiFetch("/assignments/keywords", {
        method: "POST",
        body: JSON.stringify({ transcript }),
      });
      setKeywords(res.keywords || []);
      toast.success("Keywords extracted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to extract keywords");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) { toast.error("Paste a lecture transcript first"); return; }
    if (!title.trim()) { toast.error("Enter an assignment title"); return; }
    setLoadingCreate(true);
    try {
      const res = await apiFetch("/assignments/generate", {
        method: "POST",
        body: JSON.stringify({ transcript, title }),
      });
      setQuestions(res.questions_parsed || JSON.parse(res.questions || "{}"));
      setRecentAssignments(prev => [res, ...prev]);
      toast.success("Assignment generated and saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate assignment");
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Create Assignment</h1>
      <p className="text-sm text-muted-foreground mb-8">Design assignments for your students</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">New Assignment</h2>
          <form className="space-y-4" onSubmit={handleGenerate}>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title..." className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Lecture Transcript <span className="text-primary text-xs">(required for AI)</span>
              </label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                placeholder="Paste lecture transcript here..." rows={5} className={`${inputClass} resize-none`} />
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((k, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">{k}</span>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <GlowButton variant="primary" type="submit" disabled={loadingCreate}>
                <Plus className="w-4 h-4" /> {loadingCreate ? "Generating..." : "Generate"}
              </GlowButton>
              <GlowButton variant="secondary" type="button" onClick={handleAISuggest} disabled={loadingAI}>
                <Sparkles className="w-4 h-4" /> {loadingAI ? "Extracting..." : "AI Suggest"}
              </GlowButton>
            </div>
          </form>

          {questions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
              <h3 className="font-semibold text-sm text-primary">Generated Questions</h3>
              {(questions.multiple_choice_questions || []).map((q: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs">
                  <p className="font-medium mb-1">MCQ {i + 1}: {q.question}</p>
                  {q.options?.map((o: string, j: number) => (
                    <p key={j} className={`ml-2 ${o === q.answer ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {String.fromCharCode(65 + j)}. {o}
                    </p>
                  ))}
                </div>
              ))}
              {(questions.short_answer_questions || []).map((q: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs">
                  <p className="font-medium">SAQ {i + 1}: {q.question}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Recent Assignments</h2>
          {recentAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((a, i) => (
                <div key={a.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm">{a.title}</span>
                  <span className="text-xs text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleDateString() : "new"}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Assignments;
