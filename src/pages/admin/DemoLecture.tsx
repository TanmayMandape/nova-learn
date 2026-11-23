import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, Mic, Sparkles, ChevronDown, ChevronUp,
  Clock, Calendar, Tag, CheckCircle2, AlertCircle,
} from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { DEMO_LECTURE, DEMO_ASSIGNMENT } from "@/data/demoLecture";
import { toast } from "sonner";

type Tab = "summary" | "transcript" | "notes" | "assignment";

const DemoLecture = () => {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [showAssignment, setShowAssignment] = useState(false);

  const handleDemoAction = (label: string) => {
    toast.info(`${label} — This feature will be connected to the AI pipeline in the next phase.`, {
      duration: 3500,
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "summary", label: "Summary & Topics", icon: BookOpen },
    { id: "transcript", label: "Transcript", icon: FileText },
    { id: "notes", label: "AI Notes", icon: Sparkles },
    { id: "assignment", label: "Assignment", icon: CheckCircle2 },
  ];

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
          <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Faculty: {DEMO_LECTURE.faculty}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <GlowButton variant="secondary" onClick={() => handleDemoAction("Start New Recording")}>
          <Mic className="w-4 h-4" /> Start Recording
        </GlowButton>
        <GlowButton variant="secondary" onClick={() => handleDemoAction("Generate AI Notes")}>
          <Sparkles className="w-4 h-4" /> Generate Notes
        </GlowButton>
        <GlowButton variant="secondary" onClick={() => handleDemoAction("Upload PDF Materials")}>
          <FileText className="w-4 h-4" /> Upload PDF
        </GlowButton>
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

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "summary" && (
          <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6 max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Lecture Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.summary}</p>
            </div>

            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Topics Covered</h2>
              <ul className="space-y-2">
                {DEMO_LECTURE.topics.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong p-6 rounded-xl">
              <h2 className="font-display font-semibold mb-3">Attached Learning Materials</h2>
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

        {activeTab === "transcript" && (
          <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display font-semibold">Lecture Transcript</h2>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20 font-medium">Sample</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.transcript}</p>
            </div>
          </motion.div>
        )}

        {activeTab === "notes" && (
          <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl">
            <div className="glass-strong p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold">AI Generated Notes</h2>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20 font-medium">Demo</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_LECTURE.aiNotes}</p>
            </div>
          </motion.div>
        )}

        {activeTab === "assignment" && (
          <motion.div key="assignment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl space-y-4">
            <div className="glass-strong p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold">{DEMO_ASSIGNMENT.title}</h2>
                  <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20 font-medium">Demo</span>
                </div>
                <GlowButton variant="primary" onClick={() => setShowAssignment(o => !o)}>
                  {showAssignment ? "Hide Questions" : "View Assignment"}
                </GlowButton>
              </div>
              <p className="text-xs text-muted-foreground">
                5 Multiple Choice Questions + 5 Short Answer Questions.<br />
                Generated from lecture content. Publish to students to make it visible on their dashboard.
              </p>
            </div>

            <AnimatePresence>
              {showAssignment && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-3">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Multiple Choice Questions</p>
                  {DEMO_ASSIGNMENT.mcq.map((q, i) => (
                    <div key={i} className="glass p-4 rounded-xl text-xs space-y-2">
                      <p className="font-medium">Q{i + 1}. {q.question}</p>
                      <div className="space-y-1 ml-2">
                        {q.options.map((o, j) => (
                          <p key={j} className={o === q.answer ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {o} {o === q.answer ? "✓" : ""}
                          </p>
                        ))}
                      </div>
                      <p className="text-muted-foreground/70 italic border-t border-border pt-2">
                        Explanation: {q.explanation}
                      </p>
                    </div>
                  ))}
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-4">Short Answer Questions</p>
                  {DEMO_ASSIGNMENT.shortAnswer.map((q, i) => (
                    <div key={i} className="glass p-4 rounded-xl text-xs space-y-2">
                      <p className="font-medium">Q{i + 6}. {q.question}</p>
                      <p className="text-muted-foreground/70 italic border-t border-border pt-2">
                        Sample Answer: {q.sampleAnswer}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoLecture;
