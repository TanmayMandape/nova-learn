import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

const DEMO_LECTURE = {
  id: "demo-1",
  title: "AI & ML Fundamentals",
  summary: `📚 AI Generated Notes — Artificial Intelligence & ML Fundamentals

1. Supervised Learning: Model trained on labeled datasets to predict outcomes.
2. Neural Networks: Computational models inspired by biological brain structure.
3. Gradient Descent: Optimization algorithm that minimizes the loss function.
4. Backpropagation: Method to calculate gradients and update weights.
5. Overfitting: Model performs well on training data but poorly on new data.
6. Underfitting: Model too simple to capture patterns in data.
7. Cross-Validation: Technique to evaluate model generalization.
8. NLP: Enables machines to understand and process human language.
9. Computer Vision: AI field focused on image and video understanding.`,
  created_at: new Date().toISOString(),
};

const AINotes = () => {
  const [lectures, setLectures] = useState<any[]>([DEMO_LECTURE]);
  const [selected, setSelected] = useState<any>(DEMO_LECTURE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/lectures/")
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          // Merge real lectures with demo, real ones first
          const merged = [...list, DEMO_LECTURE];
          setLectures(merged);
          setSelected(merged[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" /> AI Generated Notes
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Auto-summarized from your lectures</p>

      {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading notes...</p>}

      {!loading && (
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="flex gap-2 flex-wrap">
            {lectures.map((lec) => (
              <button key={lec.id} onClick={() => setSelected(lec)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  selected?.id === lec.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {lec.title}
              </button>
            ))}
          </div>

          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-strong p-8 rounded-xl">
              <h2 className="font-display text-lg font-semibold gradient-text mb-4">{selected.title}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {selected.summary || selected.notes || "No notes available."}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AINotes;
