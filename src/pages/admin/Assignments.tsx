import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Send } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const DEMO_KEYWORDS = [
  "Machine Learning", "Neural Networks", "Gradient Descent", "Backpropagation",
  "Overfitting", "Supervised Learning", "Cross-Validation", "NLP", "Computer Vision", "Deep Learning",
];

const DEMO_MCQ = [
  { q: "What is supervised learning?", options: ["Learning without any data", "Learning from labeled datasets", "Learning from unlabeled data", "Random guessing"], ans: 1 },
  { q: "What does gradient descent do?", options: ["Increases the loss function", "Minimizes the loss function", "Removes neural network layers", "Adds more training data"], ans: 1 },
  { q: "What is overfitting?", options: ["Model performs poorly on all data", "Model is too simple", "Model performs well on training but poorly on new data", "Model has too few parameters"], ans: 2 },
  { q: "Which is an application of computer vision?", options: ["Text translation", "Speech recognition", "Image classification", "Data sorting"], ans: 2 },
  { q: "What is backpropagation used for?", options: ["Forward pass of data", "Calculating and updating weights", "Data preprocessing", "Model deployment"], ans: 1 },
];

const DEMO_SAQ = [
  "Explain the difference between overfitting and underfitting.",
  "What is the role of gradient descent in training neural networks?",
  "How does cross-validation help in model evaluation?",
  "Give two real-world applications of natural language processing.",
  "Why are neural networks called 'inspired by the human brain'?",
];

const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

const Assignments = () => {
  const [title, setTitle] = useState("AI & ML Fundamentals — Assignment 1");
  const [transcript, setTranscript] = useState("Today we covered the fundamentals of Artificial Intelligence and Machine Learning...");
  const [showKeywords, setShowKeywords] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleAISuggest = () => {
    setLoadingAI(true);
    setShowKeywords(false);
    setTimeout(() => { setShowKeywords(true); setLoadingAI(false); }, 1000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCreate(true);
    setShowQuestions(false);
    setPublished(false);
    setTimeout(() => { setShowQuestions(true); setLoadingCreate(false); }, 2000);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const author = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}").email || "Faculty"; }
        catch { return "Faculty"; }
      })();
      await apiFetch("/assignments/publish", {
        method: "POST",
        body: JSON.stringify({
          title,
          questions: { multiple_choice_questions: DEMO_MCQ, short_answer_questions: DEMO_SAQ.map(q => ({ question: q })) },
          keywords: DEMO_KEYWORDS,
          author,
        }),
      });
      setPublished(true);
      toast.success("Assignment published! Students can now see it.");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    } finally {
      setPublishing(false);
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
              <label className="text-sm text-muted-foreground mb-1 block">Lecture Transcript</label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                rows={4} className={`${inputClass} resize-none`} />
            </div>

            <AnimatePresence>
              {showKeywords && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
                  {DEMO_KEYWORDS.map((k) => (
                    <span key={k} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">{k}</span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <GlowButton variant="primary" type="submit" disabled={loadingCreate}>
                <Plus className="w-4 h-4" /> {loadingCreate ? "Generating..." : "Generate"}
              </GlowButton>
              <GlowButton variant="secondary" type="button" onClick={handleAISuggest} disabled={loadingAI}>
                <Sparkles className="w-4 h-4" /> {loadingAI ? "Extracting..." : "AI Suggest"}
              </GlowButton>
            </div>
          </form>

          <AnimatePresence>
            {showQuestions && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                <h3 className="font-semibold text-sm text-primary">Generated Questions</h3>
                {DEMO_MCQ.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs">
                    <p className="font-medium mb-1.5">MCQ {i + 1}: {q.q}</p>
                    {q.options.map((o, j) => (
                      <p key={j} className={`ml-2 py-0.5 ${j === q.ans ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + j)}. {o} {j === q.ans ? "✓" : ""}
                      </p>
                    ))}
                  </div>
                ))}
                {DEMO_SAQ.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs">
                    <p className="font-medium">Q{i + 6}: {q}</p>
                  </div>
                ))}

                {/* Publish button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                  <GlowButton
                    variant={published ? "secondary" : "primary"}
                    type="button"
                    onClick={handlePublish}
                    disabled={published || publishing}
                    className="w-full justify-center"
                  >
                    <Send className="w-4 h-4" />
                    {publishing ? "Publishing..." : published ? "✅ Published" : "📤 Publish to Students"}
                  </GlowButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Recent Assignments</h2>
          <div className="space-y-3">
            {[
              { title: "AI & ML Fundamentals — Assignment 1", count: 12 },
              { title: "Data Structures Quiz 3", count: 28 },
              { title: "Algorithm Analysis HW", count: 24 },
              { title: "Binary Trees Practice", count: 19 },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-sm">{a.title}</span>
                <span className="text-xs text-muted-foreground">{a.count} submissions</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Assignments;
