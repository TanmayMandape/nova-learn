import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MessageSquare,
  ClipboardList,
  User,
  Zap,
  BookOpen,
  Star,
  TrendingUp,
  CheckCircle2,
  Bell,
  Megaphone,
  GraduationCap,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlowButton from "@/components/GlowButton";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  getDemoUser,
  getActiveClassroom,
  setActiveClassroom,
  ClassroomInfo,
} from "@/lib/auth";
import { toast } from "sonner";

const navItems = [
  { icon: BookOpen, label: "Overview", path: "/student" },
  { icon: Megaphone, label: "Announcements", path: "/student/announcements" },
  { icon: Sparkles, label: "Demo Lecture (ANN)", path: "/student/demo-lecture" },
  { icon: Zap, label: "AI Lecture Notes", path: "/student/notes" },
  { icon: FileText, label: "PDF AI Explainer", path: "/student/explainer" },
  { icon: ClipboardList, label: "Assignments & Quizzes", path: "/student/assignments" },
  { icon: MessageSquare, label: "AI Doubt Solver", path: "/student/chatbot" },
  { icon: User, label: "My Learning Profile", path: "/student/profile" },
];

const AnnouncementBell = ({
  announcements,
  onViewAll,
}: {
  announcements: any[];
  onViewAll?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const recent = announcements.filter((a) => {
    try {
      const t = new Date(a.created_at).getTime();
      return Date.now() - t < 48 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors border border-border"
        title="Announcements"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {recent.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {recent.length > 9 ? "9+" : recent.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden border border-border"
          >
            <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <p className="text-xs font-bold text-foreground tracking-wide flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" /> Class Announcements
              </p>
              {recent.length > 0 && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {recent.length} new
                </span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
              {announcements.map((a, i) => (
                <div key={a.id || i} className="p-3 hover:bg-muted/20 transition-colors">
                  <p className="text-xs font-semibold text-foreground leading-snug">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                  <div className="flex items-center justify-between gap-1 mt-1.5 text-[10px] text-muted-foreground/60">
                    <span>{a.author || "Faculty"}</span>
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="p-6 text-xs text-muted-foreground text-center">No announcements yet.</p>
              )}
            </div>
            <div className="p-2.5 border-t border-border bg-muted/20 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  if (onViewAll) onViewAll();
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 w-full"
              >
                View All Announcements <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentOverview = () => {
  const navigate = useNavigate();
  const user = getDemoUser();
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([]);
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [latestLecture, setLatestLecture] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({
    enrolled_classrooms: 0,
    available_lectures: 0,
    materials_count: 0,
    pending_assignments: 0,
    completed_assignments: 0,
    credits: 0,
    avg_score: 0,
  });

  // Join Classroom state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchStudentData = async () => {
    if (!user) return;
    try {
      // 1. Fetch enrolled classrooms
      const classList: ClassroomInfo[] = await apiFetch(`/classrooms/enrolled/${user.id}`);
      setClassrooms(classList || []);

      const current = getActiveClassroom();
      const currentClass = classList.find((c) => c.id === current?.id) || classList[0] || null;
      setActiveClass(currentClass);
      setActiveClassroom(currentClass);

      // 2. Fetch analytics
      const stats = await apiFetch(`/classrooms/analytics/student/${user.id}`);
      setAnalytics(stats || {});

      // 3. Fetch announcements for this student and classroom
      const annUrl = currentClass
        ? `/announcements/?student_id=${user.id}&classroom_id=${currentClass.id}`
        : `/announcements/?student_id=${user.id}`;
      const annRes = await apiFetch(annUrl);
      setAnnouncements(annRes.announcements || []);

      // 4. Fetch latest lecture
      const lecRes = await apiFetch(
        currentClass ? `/lectures/?classroom_id=${currentClass.id}` : "/lectures/"
      );
      if (Array.isArray(lecRes) && lecRes.length > 0) {
        setLatestLecture(lecRes[0]);
      } else {
        setLatestLecture(null);
      }
    } catch (err) {
      console.warn("Error fetching student dashboard:", err);
    }
  };

  useEffect(() => {
    fetchStudentData();

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      fetchStudentData();
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [user?.id]);

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a 6-character classroom code");
      return;
    }

    setJoining(true);
    try {
      const res = await apiFetch("/classrooms/join", {
        method: "POST",
        body: JSON.stringify({
          code: cleanCode,
          student_id: user?.id || "stu_demo",
          student_name: user?.full_name || "Student Demo",
          student_email: user?.email || "student@gmail.com",
        }),
      });

      if (res.success && res.classroom) {
        toast.success(`Successfully joined ${res.classroom.name}!`);
        setShowJoinModal(false);
        setJoinCode("");
        setActiveClass(res.classroom);
        setActiveClassroom(res.classroom);
        fetchStudentData();
        window.dispatchEvent(new CustomEvent("classroomChanged", { detail: res.classroom }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to join classroom. Check code.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Welcome back, {user?.full_name || "Student"}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personalized learning dashboard and interactive study space
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <GlowButton variant="secondary" onClick={() => setShowJoinModal(true)}>
            <Plus className="w-4 h-4" /> Join Classroom
          </GlowButton>
          <AnnouncementBell
            announcements={announcements}
            onViewAll={() => navigate("/student/announcements")}
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Classroom Credits",
            value: analytics.credits,
            icon: Star,
            color: "text-primary",
            sub: "earned so far",
          },
          {
            label: "Enrolled Courses",
            value: analytics.enrolled_classrooms,
            icon: GraduationCap,
            color: "text-glow-cyan",
            sub: "active classrooms",
          },
          {
            label: "Pending Quizzes",
            value: `${analytics.pending_assignments} pending`,
            icon: ClipboardList,
            color: "text-secondary",
            sub: `${analytics.completed_assignments} submitted`,
          },
          {
            label: "Available Notes & PDFs",
            value: `${analytics.available_lectures + analytics.materials_count} items`,
            icon: FileText,
            color: "text-accent",
            sub: "ready for AI review",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="float-card p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Classrooms Banner / Enrolled List */}
      <div className="glass p-6 rounded-2xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-base">Your Enrolled Classrooms</h2>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Join Another Classroom
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2.5" />
            <h3 className="font-medium text-sm">You are not enrolled in any classroom yet</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Ask your teacher for their 6-character classroom join code.
            </p>
            <GlowButton variant="primary" onClick={() => setShowJoinModal(true)}>
              Enter Classroom Code
            </GlowButton>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classrooms.map((c) => {
              const isSelected = activeClass?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveClass(c);
                    setActiveClassroom(c);
                    window.dispatchEvent(new CustomEvent("classroomChanged", { detail: c }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/15 border-primary shadow-sm"
                      : "bg-muted/30 border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 uppercase">
                      {c.subject}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Faculty: {c.faculty_email || "Professor"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Synchronized Lecture */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Synchronized Lecture Notes
              </h2>
              {latestLecture && (
                <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Summarized
                </span>
              )}
            </div>

            {latestLecture ? (
              <div>
                <h3 className="font-semibold text-sm mb-1">{latestLecture.title}</h3>
                <p className="text-xs text-muted-foreground/70 mb-3">
                  Recorded: {new Date(latestLecture.created_at).toLocaleString()}
                </p>
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                  {latestLecture.summary || latestLecture.transcript || "Notes are ready."}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-muted-foreground">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p>No lectures recorded yet in this classroom.</p>
                <p className="mt-1">When faculty records a lecture, AI notes will synchronize here.</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
            <button
              onClick={() => navigate("/student/notes")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Explore All Lecture Notes <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate("/student/explainer")}
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              PDF AI Explainer <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Classroom Broadcasts Widget */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Classroom Broadcasts
              </h2>
              {announcements.length > 0 && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  {announcements.length} total
                </span>
              )}
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                <Megaphone className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p>No recent broadcasts from your faculty.</p>
                <p className="mt-1">When instructors post announcements, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a, i) => {
                  const isRecent = (() => {
                    try {
                      return Date.now() - new Date(a.created_at).getTime() < 48 * 60 * 60 * 1000;
                    } catch {
                      return false;
                    }
                  })();

                  return (
                    <div
                      key={a.id || i}
                      className={`p-3.5 rounded-xl border text-xs transition-colors ${
                        isRecent
                          ? "bg-primary/5 border-primary/30"
                          : "bg-muted/20 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-xs leading-snug">{a.title}</p>
                          {isRecent && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-[9px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        {a.classroom_name && (
                          <span className="text-[10px] text-secondary font-medium px-1.5 py-0.5 rounded bg-secondary/10 shrink-0">
                            {a.classroom_name}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{a.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40 text-[10px] text-muted-foreground/70">
                        <span>{a.author || "Faculty"}</span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
            <button
              onClick={() => navigate("/student/announcements")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Announcements <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-muted-foreground/60">
              {announcements.length > 3 ? `+${announcements.length - 3} more` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Join Classroom Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong p-6 md:p-8 rounded-2xl max-w-md w-full border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Join a Classroom</h2>
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-character code provided by your faculty
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleJoinClassroom} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Classroom Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DBMS01"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-center text-lg font-mono font-bold tracking-widest text-primary focus:outline-none focus:border-primary transition-all uppercase"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <GlowButton variant="ghost" type="button" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </GlowButton>
                  <GlowButton variant="primary" type="submit" disabled={joining}>
                    {joining ? "Joining..." : "Join Classroom"}
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentDashboard = () => {
  const location = useLocation();
  const isRoot = location.pathname === "/student";

  return (
    <DashboardLayout items={navItems} role="student">
      {isRoot ? <StudentOverview /> : <Outlet />}
    </DashboardLayout>
  );
};

export default StudentDashboard;
