import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      const data = await apiFetch("/assignments/published");
      setAssignments(data.assignments || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 30000);
    return () => clearInterval(interval);
  }, [fetchAssignments]);

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id);

  const renderQuestions = (questions: any) => {
    if (!questions) return null;
    let parsed = questions;
    if (typeof questions === "string") {
      try { parsed = JSON.parse(questions); } catch { return <p className="text-xs text-muted-foreground">{questions}</p>; }
    }
    const mcq: any[] = parsed.multiple_choice_questions || [];
    const saq: any[] = parsed.short_answer_questions || [];

    return (
      <div className="space-y-3 mt-4">
        {mcq.map((q: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-muted/20 text-xs">
            <p className="font-medium mb-2">MCQ {i + 1}: {q.q || q.question}</p>
            {(q.options || []).map((o: string, j: number) => (
              <p key={j} className="ml-2 py-0.5 text-muted-foreground">
                {String.fromCharCode(65 + j)}. {o}
              </p>
            ))}
          </div>
        ))}
        {saq.map((q: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-muted/20 text-xs">
            <p className="font-medium mb-2">Q{i + mcq.length + 1}: {q.question || q.q}</p>
            <textarea
              placeholder="Write your answer here..."
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 resize-none transition-all"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Assignments</h1>
      <p className="text-sm text-muted-foreground mb-8">Your pending assignments from faculty</p>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading assignments...</p>
      )}

      {!loading && assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">No assignments yet. Check back after your next lecture.</p>
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div className="space-y-4 max-w-2xl">
          {assignments.map((a, i) => (
            <motion.div key={a.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} className="float-card rounded-xl overflow-hidden">
              {/* Header */}
              <button onClick={() => toggle(a.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors">
                <div>
                  <h3 className="font-medium text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted by {a.author} • {a.created_at}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                    Pending
                  </span>
                  {expanded === a.id
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded questions */}
              <AnimatePresence>
                {expanded === a.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-border">
                    <div className="p-5">
                      {a.keywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {a.keywords.map((k: string) => (
                            <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{k}</span>
                          ))}
                        </div>
                      )}
                      {renderQuestions(a.questions)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
