import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ClipboardList, CheckCircle2, Send, GraduationCap, Award } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { getDemoUser, getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import GlowButton from "@/components/GlowButton";
import { toast } from "sonner";

const StudentAssignments = () => {
  const user = getDemoUser();
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Form answer state: { [assignmentId]: { [questionIndex]: answerString } }
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchAssignmentsAndSubmissions = useCallback(async (classId?: string) => {
    if (!classId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch published assignments
      const data = await apiFetch(`/assignments/published?classroom_id=${classId}`);
      const list = data.assignments || [];
      setAssignments(list);
      if (list.length > 0 && !expanded) {
        setExpanded(list[0].id);
      }

      // 2. Fetch student's existing submissions
      if (user) {
        const subs: any[] = await apiFetch(
          `/submissions?classroom_id=${classId}&student_id=${user.id}`
        );
        const subMap: Record<string, any> = {};
        for (const s of subs) {
          subMap[s.assignment_id] = s;
        }
        setSubmissions(subMap);
      }
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAssignmentsAndSubmissions(activeClass?.id);

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      setExpanded(null);
      fetchAssignmentsAndSubmissions(e.detail?.id);
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id, fetchAssignmentsAndSubmissions]);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const handleSelectAnswer = (assignmentId: string, qIndex: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] || {}),
        [qIndex]: val,
      },
    }));
  };

  const handleSubmitQuiz = async (assignmentId: string) => {
    const studentAnswers = answers[assignmentId] || {};
    const formattedAnswers = Object.entries(studentAnswers).map(([k, v]) => ({
      question_index: parseInt(k, 10),
      answer: v,
    }));

    if (formattedAnswers.length === 0) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(assignmentId);
    try {
      const res = await apiFetch("/assignments/submit", {
        method: "POST",
        body: JSON.stringify({
          assignment_id: assignmentId,
          classroom_id: activeClass?.id || null,
          student_id: user?.id || "stu_demo",
          student_name: user?.full_name || "Student Demo",
          student_email: user?.email || "student@gmail.com",
          content: formattedAnswers,
        }),
      });

      if (res.success && res.submission) {
        toast.success(
          `Assignment Submitted! Score: ${res.submission.score}% (${res.submission.grade})`
        );
        setSubmissions((prev) => ({
          ...prev,
          [assignmentId]: res.submission,
        }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(null);
    }
  };

  const renderQuestions = (assignment: any) => {
    let parsed = assignment.questions_parsed || assignment.questions;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return <p className="text-xs text-muted-foreground">{parsed}</p>;
      }
    }

    const mcq: any[] = parsed?.multiple_choice_questions || parsed?.mcq || [];
    const saq: any[] = parsed?.short_answer_questions || parsed?.short_answer || [];
    const existingSub = submissions[assignment.id];
    const isSubmitted = !!existingSub;

    return (
      <div className="space-y-4 mt-4">
        {/* Submission notification banner if already completed */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-500">
                You completed this quiz on {new Date(existingSub.submitted_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-500" />
              <span className="font-bold text-foreground">
                Score: {existingSub.score}% ({existingSub.grade})
              </span>
            </div>
          </div>
        )}

        {/* Multiple Choice Questions */}
        {mcq.map((q: any, i: number) => {
          const currentSelection = answers[assignment.id]?.[i];
          return (
            <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
              <p className="font-semibold text-foreground">
                MCQ {i + 1}: {q.question || q.q}
              </p>
              <div className="space-y-1.5 ml-1 pt-1">
                {(q.options || []).map((o: string, j: number) => {
                  const optLabel = String.fromCharCode(65 + j);
                  const isChecked = currentSelection === o || currentSelection === optLabel;
                  return (
                    <label
                      key={j}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "hover:bg-muted/40 text-muted-foreground"
                      } ${isSubmitted ? "pointer-events-none opacity-80" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`mcq_${assignment.id}_${i}`}
                        value={o}
                        checked={isChecked}
                        onChange={() => handleSelectAnswer(assignment.id, i, o)}
                        disabled={isSubmitted}
                        className="accent-primary"
                      />
                      <span className="font-medium">{o}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Short Answer Questions */}
        {saq.map((q: any, i: number) => {
          const qIndex = i + mcq.length;
          const currentVal = answers[assignment.id]?.[qIndex] || "";
          return (
            <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
              <p className="font-semibold text-foreground">
                Q{qIndex + 1}: {q.question || q.q}
              </p>
              <textarea
                placeholder={isSubmitted ? "Response recorded." : "Write your explanation here..."}
                rows={2}
                value={currentVal}
                onChange={(e) => handleSelectAnswer(assignment.id, qIndex, e.target.value)}
                disabled={isSubmitted}
                className="w-full mt-1 px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary resize-none transition-all"
              />
            </div>
          );
        })}

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="pt-2">
            <GlowButton
              variant="primary"
              onClick={() => handleSubmitQuiz(assignment.id)}
              disabled={submitting === assignment.id}
              className="w-full justify-center py-3"
            >
              <Send className="w-4 h-4" />
              {submitting === assignment.id ? "Submitting Answers..." : "Submit Assignment Answers"}
            </GlowButton>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Classroom Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Test your knowledge, submit answers, and earn classroom credits
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
        <p className="text-sm text-muted-foreground animate-pulse text-center py-12">
          Loading classroom assignments...
        </p>
      )}

      {!loading && assignments.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center max-w-xl mx-auto border border-dashed border-border">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm">No Assignments Published Yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Check back after your faculty publishes a new lecture assignment for this classroom.
          </p>
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div className="space-y-4 max-w-3xl">
          {assignments.map((a) => {
            const isSubmitted = !!submissions[a.id];
            const isExp = expanded === a.id;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-2xl overflow-hidden border border-border shadow-sm"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggle(a.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Posted by {a.author || "Faculty"} • {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {isSubmitted ? (
                      <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-500 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done ({submissions[a.id].score}%)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold">
                        Pending
                      </span>
                    )}
                    {isExp ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded questions */}
                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-6">
                        {renderQuestions(a)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
