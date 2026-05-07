import { motion, AnimatePresence } from "framer-motion";
import { FileText, MessageSquare, ClipboardList, User, Zap, BookOpen, Star, TrendingUp, CheckCircle2, Bell } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { icon: BookOpen, label: "Overview", path: "/student" },
  { icon: FileText, label: "Lecture Transcript", path: "/student/transcript" },
  { icon: Zap, label: "AI Notes", path: "/student/notes" },
  { icon: ClipboardList, label: "Assignments", path: "/student/assignments" },
  { icon: MessageSquare, label: "AI Doubt Solver", path: "/student/chatbot" },
  { icon: User, label: "Profile", path: "/student/profile" },
];

// Bell icon with badge + dropdown — rendered inside the overview
const AnnouncementBell = ({ announcements }: { announcements: any[] }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const recent = announcements.filter(a => {
    const t = new Date(a.created_at).getTime();
    return Date.now() - t < 24 * 60 * 60 * 1000;
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
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {recent.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {recent.length > 9 ? "9+" : recent.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-10 w-80 glass-strong rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Announcements</p>
            </div>
            {announcements.slice(0, 3).map((a, i) => (
              <div key={a.id || i} className="p-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.author} • {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No announcements yet.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentOverview = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const lastCountRef = useRef(0);

  const fetchAnnouncements = useCallback(async (isPolling = false) => {
    try {
      const data = await apiFetch("/announcements/");
      const list: any[] = data.announcements || [];
      if (isPolling && list.length > lastCountRef.current) {
        const newest = list[0];
        toast(`📢 New announcement: ${newest.title}`, { duration: 5000 });
      }
      lastCountRef.current = list.length;
      setAnnouncements(list);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchAnnouncements(false);
    const interval = setInterval(() => fetchAnnouncements(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, Student!</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Your learning dashboard at a glance</p>
        </div>
        <AnnouncementBell announcements={announcements} />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Credits", value: "920", icon: Star, color: "text-primary" },
          { label: "Rank", value: "#5", icon: TrendingUp, color: "text-glow-cyan" },
          { label: "Assignments", value: "1 pending", icon: ClipboardList, color: "text-secondary" },
          { label: "Notes", value: "1 saved", icon: FileText, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="float-card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Lecture */}
        <div className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Latest Lecture</h2>
          <div>
            <div className="flex items-start justify-between mb-1">
              <p className="text-sm font-medium">AI & ML Fundamentals</p>
              <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Transcribed
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60 mb-1">Today, 10:30 AM • 4:32 minutes</p>
            <div className="mt-3 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground leading-relaxed">
              "Today we covered the fundamentals of Artificial Intelligence and Machine Learning. We discussed supervised learning, neural networks, gradient descent, backpropagation and model evaluation..."
            </div>
            <button onClick={() => navigate("/student/notes")}
              className="mt-3 text-xs font-semibold text-primary hover:underline transition-all">
              View Notes →
            </button>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">📢 Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements from your teacher yet.</p>
          ) : (
            <div className="space-y-0">
              {announcements.slice(0, 5).map((a, i) => (
                <motion.div key={a.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover:bg-muted/20 rounded-lg px-2 -mx-2 transition-colors">
                  <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: a.priority === "urgent" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{a.author}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                    {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
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
