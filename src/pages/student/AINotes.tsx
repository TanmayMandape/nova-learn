import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

const AINotes = () => {
  const [lectures, setLectures] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/lectures/")
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setLectures(list);
        if (list.length > 0) setSelected(list[0]);
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

      {!loading && lectures.length === 0 && (
        <p className="text-sm text-muted-foreground">No lectures recorded yet. Record a lecture first.</p>
      )}

      {!loading && lectures.length > 0 && (
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
              {selected.summary || selected.notes ? (
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {selected.summary || selected.notes}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes available for this lecture.</p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AINotes;
