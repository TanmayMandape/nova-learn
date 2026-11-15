import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, GraduationCap, Calendar, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getActiveClassroom, ClassroomInfo } from "@/lib/auth";

const AINotes = () => {
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [lectures, setLectures] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async (classId?: string) => {
    setLoading(true);
    try {
      const url = classId ? `/lectures/?classroom_id=${classId}` : "/lectures/";
      const list = await apiFetch(url);
      const data = Array.isArray(list) ? list : [];
      setLectures(data);
      if (data.length > 0) {
        setSelected(data[0]);
      } else {
        setSelected(null);
      }
    } catch {
      setLectures([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(activeClass?.id);

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      fetchNotes(e.detail?.id);
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> AI Generated Lecture Notes
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-summarized from your faculty's recorded classroom lectures
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 text-xs text-muted-foreground animate-pulse">
          Loading classroom lecture notes...
        </div>
      )}

      {!loading && lectures.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center max-w-xl mx-auto border border-dashed border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm">No Recorded Lectures Yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            When your faculty records a live lecture in this classroom, the speech transcript and AI-generated structured notes will appear here automatically.
          </p>
        </div>
      )}

      {!loading && lectures.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Lecture Navigation Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Classroom Lectures ({lectures.length})
            </h2>
            {lectures.map((lec) => {
              const isSelected = selected?.id === lec.id;
              return (
                <button
                  key={lec.id}
                  onClick={() => setSelected(lec)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-primary/15 border-primary text-foreground shadow-sm"
                      : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <p className="font-semibold text-xs leading-snug line-clamp-2">{lec.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lec.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-primary font-medium">{lec.department || "CS"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Note Content */}
          <div className="lg:col-span-2">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong p-8 rounded-2xl border border-border space-y-6"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10">
                    {selected.department || "Computer Science"}
                  </span>
                  <h2 className="font-display text-xl font-bold gradient-text mt-2">
                    {selected.title}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Recorded on {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Structured Notes */}
                <div className="p-6 rounded-xl bg-card/60 border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> AI Summary & Concept Points
                  </h3>
                  <div className="text-xs leading-relaxed text-foreground whitespace-pre-line space-y-2">
                    {selected.summary || selected.notes || "Summary is being generated..."}
                  </div>
                </div>

                {/* Raw Transcript Collapsible / Excerpt */}
                {selected.transcript && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Full Audio Transcript
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground max-h-56 overflow-y-auto leading-relaxed">
                      {selected.transcript}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AINotes;
