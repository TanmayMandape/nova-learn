import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Sparkles,
  BookOpen,
  Code2,
  Globe,
  HelpCircle,
  ArrowRight,
  GraduationCap,
  Layers,
} from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { apiFetch } from "@/lib/api";
import { getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

interface ExplainerResponse {
  answer: string;
  realworld: string;
  code: string;
  why: string;
  next: string;
}

const SUGGESTED_QUERIES = [
  "Explain Primary Keys vs Foreign Keys",
  "What is Normalization and 3NF?",
  "How does B-Tree indexing speed up queries?",
  "What are ACID transactions and Concurrency control?",
];

const PDFExplainer = () => {
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [materials, setMaterials] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ExplainerResponse | null>(null);

  useEffect(() => {
    if (activeClass) {
      apiFetch(`/materials/?classroom_id=${activeClass.id}`)
        .then((res) => setMaterials(res.materials || []))
        .catch(() => {});
    }

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      setResponse(null);
      if (e.detail?.id) {
        apiFetch(`/materials/?classroom_id=${e.detail.id}`)
          .then((res) => setMaterials(res.materials || []))
          .catch(() => {});
      }
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  const handleAskExplainer = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      toast.error("Please enter a concept or question to explain");
      return;
    }
    if (!activeClass) {
      toast.error("Please select an enrolled classroom first.");
      return;
    }

    setLoading(true);
    setQuery(q);

    try {
      const data: ExplainerResponse = await apiFetch("/materials/query", {
        method: "POST",
        body: JSON.stringify({
          classroom_id: activeClass.id,
          query: q,
        }),
      });

      setResponse(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to query PDF Explainer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> PDF AI Explainer
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Query your classroom documents and get 5-section engineering explanations grounded in your course materials.
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      {/* Classroom Materials Summary Pills */}
      {materials.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5" /> Indexed Course Notes:
          </span>
          {materials.map((m) => (
            <span
              key={m.id}
              className="text-xs px-2.5 py-1 rounded-lg bg-muted/40 border border-border text-foreground font-mono flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3 text-primary" /> {m.title} ({m.pages}p)
            </span>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-strong p-4 rounded-2xl mb-6 border border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskExplainer();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about this course (e.g. How does B-Tree indexing work?)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all font-medium"
              disabled={loading}
            />
          </div>
          <GlowButton variant="primary" type="submit" disabled={loading} className="shrink-0">
            {loading ? "Searching Notes..." : "Explain Concept"}
          </GlowButton>
        </form>

        {/* Quick query pills */}
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground">Quick queries:</span>
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskExplainer(sq)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass p-12 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-foreground">
            Performing RAG Semantic Search over course notes...
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Extracting page citations, synthesizing real-world industrial analogies, and generating code demonstrations.
          </p>
        </div>
      )}

      {/* 5-Section Response Card */}
      {!loading && response && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-4xl"
        >
          {/* Section 1: The Answer from Notes */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden p-6 border-l-4 border-l-primary shadow-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
              Section 1 • From Course Notes
            </span>
            <h3 className="font-display font-semibold text-base text-foreground mt-1 mb-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> The Core Concept
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
              {response.answer}
            </p>
          </div>

          {/* Section 2: Real World Example */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden p-6 border-l-4 border-l-green-500 shadow-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-green-500">
              Section 2 • Industry Application
            </span>
            <h3 className="font-display font-semibold text-base text-foreground mt-1 mb-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" /> In Real Life (Engineering Analogy)
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
              {response.realworld}
            </p>
          </div>

          {/* Section 3: Code Demonstration */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden p-6 border-l-4 border-l-amber-500 shadow-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">
              Section 3 • Implementation
            </span>
            <h3 className="font-display font-semibold text-base text-foreground mt-1 mb-2.5 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-500" /> See It In Code
            </h3>
            <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground overflow-x-auto leading-relaxed">
              <code>{response.code}</code>
            </pre>
          </div>

          {/* Section 4: Why This Matters */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden p-6 border-l-4 border-l-purple-500 shadow-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-500">
              Section 4 • Strategic Value
            </span>
            <h3 className="font-display font-semibold text-base text-foreground mt-1 mb-2.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" /> Why This Matters for an Engineer
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
              {response.why}
            </p>
          </div>

          {/* Section 5: Learn Next */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden p-6 border-l-4 border-l-pink-500 shadow-sm">
            <span className="text-[10px] font-bold tracking-widest uppercase text-pink-500">
              Section 5 • Curriculum Path
            </span>
            <h3 className="font-display font-semibold text-base text-foreground mt-1 mb-2.5 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-pink-500" /> Next Topics to Learn
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
              {response.next}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PDFExplainer;
