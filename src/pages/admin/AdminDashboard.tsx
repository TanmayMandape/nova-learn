import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  ClipboardList,
  Megaphone,
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Plus,
  Copy,
  Check,
  GraduationCap,
  FileText,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlowButton from "@/components/GlowButton";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import {
  getDemoUser,
  getActiveClassroom,
  setActiveClassroom,
  ClassroomInfo,
} from "@/lib/auth";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Mic, label: "Lecture Recording", path: "/admin/recording" },
  { icon: BookOpen, label: "Demo Lecture (ANN)", path: "/admin/demo-lecture" },
  { icon: FileText, label: "Course Materials & PDF", path: "/admin/materials" },
  { icon: ClipboardList, label: "Assignments & Grading", path: "/admin/assignments" },
  { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
  { icon: Users, label: "Student Leaderboard", path: "/admin/credits" },
];

const AdminOverview = () => {
  const user = getDemoUser();
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([]);
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    total_classrooms: 0,
    total_students: 0,
    active_lectures: 0,
    materials_count: 0,
    assignments_count: 0,
    total_submissions: 0,
    avg_score: 0,
  });

  // Modal / Form state for creating a classroom
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    if (!user) return;
    try {
      // 1. Fetch classrooms
      const classList: ClassroomInfo[] = await apiFetch(`/classrooms/?faculty_id=${user.id}`);
      setClassrooms(classList || []);

      if (classList && classList.length > 0) {
        const current = getActiveClassroom();
        const found = classList.find((c) => c.id === current?.id) || classList[0];
        setActiveClass(found);
        setActiveClassroom(found);

        // Fetch enrolled students for active class
        const studentList = await apiFetch(`/classrooms/${found.id}/students`);
        setStudents(studentList || []);
      }

      // 2. Fetch real analytics
      const stats = await apiFetch(`/classrooms/analytics/faculty/${user.id}`);
      setAnalytics(stats || {});
    } catch (err) {
      console.warn("Overview fetch error:", err);
    }
  };

  useEffect(() => {
    fetchOverviewData();

    const handleClassChange = (e: any) => {
      const c = e.detail;
      setActiveClass(c);
      if (c?.id) {
        apiFetch(`/classrooms/${c.id}/students`)
          .then((res) => setStudents(res || []))
          .catch(() => {});
      }
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [user?.id]);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) {
      toast.error("Please provide both classroom name and subject.");
      return;
    }

    setCreating(true);
    try {
      const newClass: ClassroomInfo = await apiFetch("/classrooms/", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          description: description.trim(),
          faculty_id: user?.id || "fac_demo",
          faculty_email: user?.email || "faculty@university.edu",
        }),
      });

      toast.success(`Classroom "${newClass.name}" created! Join Code: ${newClass.code}`);
      setShowCreateModal(false);
      setName("");
      setSubject("");
      setDescription("");

      // Refresh list & activate new classroom
      setActiveClass(newClass);
      setActiveClassroom(newClass);
      fetchOverviewData();
      window.dispatchEvent(new CustomEvent("classroomChanged", { detail: newClass }));
    } catch (err: any) {
      toast.error(err.message || "Failed to create classroom");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code ${code} to clipboard! Share with students.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your courses, lectures, study materials, and student progress
          </p>
        </div>
        <GlowButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Classroom
        </GlowButton>
      </div>

      {/* Dynamic Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Enrolled Students",
            value: analytics.total_students,
            icon: Users,
            trend: "+ real-time",
            color: "text-primary",
          },
          {
            label: "Classrooms Created",
            value: analytics.total_classrooms,
            icon: GraduationCap,
            trend: "active",
            color: "text-glow-cyan",
          },
          {
            label: "Active Lectures",
            value: analytics.active_lectures,
            icon: BookOpen,
            trend: "recorded",
            color: "text-secondary",
          },
          {
            label: "Assignments & Submissions",
            value: `${analytics.total_submissions} sub`,
            icon: ClipboardList,
            trend: analytics.avg_score ? `${analytics.avg_score}% avg` : "pending",
            color: "text-accent",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="float-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-xs font-medium text-glow-cyan flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.trend}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Classrooms List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-base">Your Classrooms</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                {classrooms.length} {classrooms.length === 1 ? "Classroom" : "Classrooms"}
              </span>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl">
                <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-medium text-sm">No Classrooms Created Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
                  Create a classroom to generate a unique 6-character joining code for your students.
                </p>
                <GlowButton variant="secondary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4" /> Create First Classroom
                </GlowButton>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3.5">
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-muted/30 border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10">
                            {c.subject}
                          </span>
                          <h3 className="font-semibold text-sm mt-1">{c.name}</h3>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                          {c.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">Joining Code:</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(c.code);
                          }}
                          className="flex items-center gap-1.5 font-mono font-bold text-primary bg-primary/15 hover:bg-primary/25 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <span>{c.code}</span>
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Guide */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Integrated Workflow
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <p className="font-semibold text-foreground mb-1">1. Live Speech Recording</p>
                <p>Record lectures; the AI automatically transcribes speech and generates structured lecture notes.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <p className="font-semibold text-foreground mb-1">2. Course PDFs & OCR</p>
                <p>Upload digital or scanned syllabus PDFs. The system chunks and indexes them into ChromaDB.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <p className="font-semibold text-foreground mb-1">3. AI Assignments & Grading</p>
                <p>Generate 10 questions from lecture topics, publish to students, and review auto-evaluated submissions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Students Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-base">Enrolled Students</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                {students.length}
              </span>
            </div>

            {activeClass && (
              <p className="text-xs text-muted-foreground mb-3">
                Students in <span className="font-semibold text-foreground">{activeClass.name}</span>:
              </p>
            )}

            {students.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <p>No students enrolled yet.</p>
                <p className="mt-1">
                  Share join code{" "}
                  <strong className="text-primary font-mono">{activeClass?.code || "CODE"}</strong> with your students!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {students.map((st, i) => (
                  <div
                    key={st.id || i}
                    className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold uppercase shrink-0">
                        {st.student_name ? st.student_name[0] : "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{st.student_name || "Student"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {st.student_email || "student@university.edu"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap ml-2">
                      {new Date(st.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Classroom Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong p-6 md:p-8 rounded-2xl max-w-lg w-full border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Create New Classroom</h2>
                    <p className="text-xs text-muted-foreground">
                      Creates a scoped space with an auto-generated 6-character joining code
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Classroom Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Subject / Course Code</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. CS301 or DBMS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short course description or syllabus overview..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary resize-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <GlowButton
                    variant="ghost"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </GlowButton>
                  <GlowButton
                    variant="primary"
                    type="submit"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Classroom"}
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

const AdminDashboard = () => {
  const location = useLocation();
  const isRoot = location.pathname === "/admin";

  return (
    <DashboardLayout items={navItems} role="admin">
      {isRoot ? <AdminOverview /> : <Outlet />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
