import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Sparkles,
  Send,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Users,
  Award,
} from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getDemoUser, getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all";

const Assignments = () => {
  const user = getDemoUser();
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [activeTab, setActiveTab] = useState<"create" | "submissions">("create");

  // Assignment Creator state
  const [title, setTitle] = useState("Database Management Systems — Assignment 1");
  const [transcript, setTranscript] = useState(
    "In today's lecture on Database Management Systems, we covered Primary Keys, Foreign Keys, Normalization (1NF, 2NF, 3NF), B-Tree Indexing, and ACID Transactions (Atomicity, Consistency, Isolation, Durability)."
  );
  const [keywords, setKeywords] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<any>(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedAssignments, setPublishedAssignments] = useState<any[]>([]);

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchPublishedAndSubmissions = async () => {
    if (!activeClass) return;
    try {
      // 1. Fetch published assignments
      const res = await apiFetch(`/assignments/published?classroom_id=${activeClass.id}`);
      setPublishedAssignments(res.assignments || []);

      // 2. Fetch submissions
      setLoadingSubmissions(true);
      const subs = await apiFetch(`/submissions?classroom_id=${activeClass.id}`);
      setSubmissions(subs || []);
    } catch (e) {
      console.warn("Error fetching assignments data:", e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchPublishedAndSubmissions();

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      setTitle(`${e.detail.name} — Assignment 1`);
      fetchPublishedAndSubmissions();
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  const handleAISuggest = async () => {
    if (!transcript.trim()) {
      toast.error("Please enter lecture notes or transcript first.");
      return;
    }
    setLoadingKeywords(true);
    try {
      const res = await apiFetch("/assignments/keywords", {
        method: "POST",
        body: JSON.stringify({ transcript }),
      });
      setKeywords(res.keywords || []);
      toast.success("AI extracted key topics!");
    } catch (err: any) {
      toast.error(err.message || "Keyword extraction failed");
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      toast.error("Please provide transcript content to generate questions from.");
      return;
    }
    setLoadingGenerate(true);
    try {
      const res = await apiFetch("/assignments/generate", {
        method: "POST",
        body: JSON.stringify({
          transcript: transcript.trim(),
          title: title.trim(),
          keywords: keywords,
          classroom_id: activeClass?.id || null,
        }),
      });

      if (res.questions_parsed) {
        setGeneratedQuestions(res.questions_parsed);
        if (res.keywords && res.keywords.length > 0) {
          setKeywords(res.keywords);
        }
        toast.success("Generated 5 MCQs and 5 SAQs via AI!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedQuestions) {
      toast.error("Please generate questions before publishing.");
      return;
    }
    if (!activeClass) {
      toast.error("Please select a classroom first.");
      return;
    }

    setPublishing(true);
    try {
      const author = user?.full_name || "Faculty";
      await apiFetch("/assignments/publish", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: `AI-generated assignment for ${activeClass.name}`,
          questions: generatedQuestions,
          keywords: keywords,
          classroom_id: activeClass.id,
          author: author,
        }),
      });

      toast.success(`Published assignment to ${activeClass.name}!`);
      fetchPublishedAndSubmissions();
      setGeneratedQuestions(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish assignment");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Assignments & Assessment
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate AI-grounded quizzes, publish to students, and review auto-evaluated submissions
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "create"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          Create & Publish Quiz
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "submissions"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Submissions ({submissions.length})</span>
        </button>
      </div>

      {activeTab === "create" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Creator form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-6 rounded-2xl border border-border"
          >
            <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> New Classroom Assignment
            </h2>

            <form className="space-y-4" onSubmit={handleGenerate}>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Assignment Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Database Systems Quiz 1"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Lecture Transcript / Core Topics
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none leading-relaxed`}
                  placeholder="Paste lecture notes or transcript..."
                  required
                />
              </div>

              {/* Keywords Pills */}
              <AnimatePresence>
                {keywords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap gap-1.5 pt-1"
                  >
                    {keywords.map((k, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/20"
                      >
                        {k}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-2">
                <GlowButton variant="primary" type="submit" disabled={loadingGenerate}>
                  <Sparkles className="w-4 h-4" />
                  {loadingGenerate ? "Generating with AI..." : "Generate 10 Questions"}
                </GlowButton>
                <GlowButton
                  variant="secondary"
                  type="button"
                  onClick={handleAISuggest}
                  disabled={loadingKeywords}
                >
                  {loadingKeywords ? "Extracting..." : "AI Suggest Keywords"}
                </GlowButton>
              </div>
            </form>

            {/* Generated Questions Preview */}
            <AnimatePresence>
              {generatedQuestions && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t border-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-primary uppercase tracking-wider">
                      Generated Questions (Ready to Publish)
                    </h3>
                    <span className="text-[11px] text-green-500 font-medium">
                      5 MCQs + 5 Short Answers
                    </span>
                  </div>

                  {/* MCQs */}
                  <div className="space-y-3">
                    {(generatedQuestions.multiple_choice_questions || []).map((q: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs">
                        <p className="font-semibold mb-2">
                          MCQ {i + 1}: {q.question || q.q}
                        </p>
                        <div className="space-y-1 ml-2">
                          {(q.options || []).map((o: string, j: number) => {
                            const isCorrect =
                              q.answer &&
                              (o === q.answer || String.fromCharCode(65 + j) === q.answer);
                            return (
                              <p
                                key={j}
                                className={`text-[11px] ${
                                  isCorrect ? "text-primary font-bold" : "text-muted-foreground"
                                }`}
                              >
                                {o} {isCorrect ? "✓ (Answer Key)" : ""}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SAQs */}
                  <div className="space-y-2">
                    {(generatedQuestions.short_answer_questions || []).map((q: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs">
                        <p className="font-semibold">
                          Q{i + 6}: {q.question}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <GlowButton
                      variant="primary"
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing}
                      className="w-full justify-center py-3"
                    >
                      <Send className="w-4 h-4" />
                      {publishing ? "Publishing to Classroom..." : "Publish Assignment to Classroom"}
                    </GlowButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Published Assignments in this Classroom */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <h2 className="font-display font-semibold text-base mb-4 flex items-center justify-between">
                <span>Published Class Assignments</span>
                <span className="text-xs text-muted-foreground">{publishedAssignments.length}</span>
              </h2>

              {publishedAssignments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No assignments published yet in this classroom.
                </p>
              ) : (
                <div className="space-y-3">
                  {publishedAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-xs text-foreground">{a.title}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Published by {a.author || "Faculty"} • {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Submissions View */
        <div className="glass p-6 rounded-2xl border border-border">
          <h2 className="font-display font-semibold text-base mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Incoming Student Submissions</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
              {submissions.length} Total
            </span>
          </h2>

          {loadingSubmissions ? (
            <p className="text-xs text-muted-foreground animate-pulse text-center py-10">
              Loading submissions...
            </p>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p>No student submissions received yet for this classroom.</p>
              <p className="mt-1">When students complete their quizzes, results will populate here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-muted/20 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{s.student_name}</span>
                      <span className="text-muted-foreground">({s.student_email})</span>
                    </div>
                    <p className="text-[11px] text-primary font-medium">
                      Assignment: {s.assignment_title || "Classroom Quiz"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Submitted: {new Date(s.submitted_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">Score: {s.score}%</span>
                      <span className="text-[10px] text-green-500 font-semibold block">
                        Grade {s.grade || "A"}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 font-semibold text-[11px]">
                      Evaluated
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignments;
