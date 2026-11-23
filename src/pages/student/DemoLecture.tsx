import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, Sparkles, CheckCircle2, Clock, Calendar, Tag, Send,
} from "lucide-react";
import { DEMO_LECTURE, DEMO_ASSIGNMENT } from "@/data/demoLecture";
import { toast } from "sonner";

type Tab = "summary" | "notes" | "transcript" | "assignment";

const StudentDemoLecture = () => {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [saqAnswers, setSaqAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "summary", label: "Summary", icon: BookOpen },
    { id: "notes", label: "AI Notes", icon: Sparkles },
    { id: "transcript", label: "Transcript", icon: FileText },
    { id: "assignment", label: "Assignment", icon: CheckCircle2 },
  ];

  const handleSubmit = () => {
    // Validate all SAQs answered
    for (let i = 0; i < DEMO_ASSIGNMENT.shortAnswer.length; i++) {
      if (!saqAnswers[i]?.trim()) {
        toast.error(`Please answer short answer question ${i + 1} before submitting.`);
        return;
      }
    }

    // Grade MCQ
    let correct = 0;
    DEMO_ASSIGNMENT.mcq.forEach((q, i) => {
      if (mcqAnswers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);
    toast.success("Assignment submitted successfully!");
    setActiveTab("assignment");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {DEMO_LECTURE.subject}
          </span>
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            {DEMO_LECTURE.status}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold mt-2">{DEMO_LECTURE.title}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{DEMO_LECTURE.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{DEMO_LECTURE.duration}</span>
          <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{DEMO_LECTURE.faculty}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl mb-6 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5 max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Lecture Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.summary}</p>
            </div>

            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Topics Covered</h2>
              <ul className="space-y-2">
                {DEMO_LECTURE.topics.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Learning Outcomes</h2>
              <ul className="space-y-2">
                {DEMO_LECTURE.learningOutcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Attached Materials</h2>
              <div className="space-y-2">
                {DEMO_LECTURE.attachedPDFs.map((pdf, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span>{pdf.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{pdf.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI NOTES TAB */}
        {activeTab === "notes" && (
          <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold">AI Generated Notes</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.aiNotes}</p>
            </div>
          </motion.div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === "transcript" && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display font-semibold">Lecture Transcript</h2>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">Sample</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.transcript}</p>
            </div>
          </motion.div>
        )}

        {/* ASSIGNMENT TAB */}
        {activeTab === "assignment" && (
          <motion.div key="assignment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl space-y-4">

            {/* Score banner */}
            {submitted && score !== null && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-green-500">Assignment Submitted Successfully!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    MCQ Score: <strong className="text-foreground">{score} / {DEMO_ASSIGNMENT.mcq.length}</strong> correct.
                    Short answers have been recorded.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="glass-strong p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-semibold text-sm">{DEMO_ASSIGNMENT.title}</h2>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">Demo</span>
              </div>
              <p className="text-xs text-muted-foreground">Answer all questions and click Submit.</p>
            </div>

            {/* MCQ */}
            <p className="text-xs font-bold text-primary uppercase tracking-wide">Section A — Multiple Choice</p>
            {DEMO_ASSIGNMENT.mcq.map((q, i) => (
              <div key={i} className="glass p-4 rounded-xl text-xs space-y-2">
                <p className="font-medium">Q{i + 1}. {q.question}</p>
                <div className="space-y-1.5 ml-2">
                  {q.options.map((o, j) => {
                    const selected = mcqAnswers[i] === o;
                    const isCorrect = o === q.answer;
                    let cls = "flex items-center gap-2 cursor-pointer p-1.5 rounded-lg transition-colors ";
                    if (!submitted) {
                      cls += selected ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground";
                    } else {
                      cls += isCorrect
                        ? "bg-green-500/10 text-green-500 font-semibold"
                        : selected
                        ? "bg-destructive/10 text-destructive"
                        : "text-muted-foreground";
                    }
                    return (
                      <label key={j} className={cls}>
                        <input type="radio" name={`mcq-${i}`} value={o} disabled={submitted}
                          checked={selected} onChange={() => setMcqAnswers(p => ({ ...p, [i]: o }))}
                          className="accent-primary shrink-0" />
                        {o}
                        {submitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-500" />}
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-muted-foreground/70 italic text-[11px] border-t border-border pt-2">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {/* SAQ */}
            <p className="text-xs font-bold text-primary uppercase tracking-wide mt-2">Section B — Short Answer</p>
            {DEMO_ASSIGNMENT.shortAnswer.map((q, i) => (
              <div key={i} className="glass p-4 rounded-xl text-xs space-y-2">
                <p className="font-medium">Q{i + 6}. {q.question}</p>
                <textarea
                  rows={3}
                  disabled={submitted}
                  value={saqAnswers[i] || ""}
                  onChange={e => setSaqAnswers(p => ({ ...p, [i]: e.target.value }))}
                  placeholder="Write your answer here..."
                  className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 resize-none transition-all disabled:opacity-60"
                />
                {submitted && (
                  <p className="text-muted-foreground/70 italic text-[11px] border-t border-border pt-2">
                    Sample Answer: {q.sampleAnswer}
                  </p>
                )}
              </div>
            ))}

            {!submitted && (
              <button onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
                <Send className="w-4 h-4" /> Submit Assignment
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDemoLecture;
