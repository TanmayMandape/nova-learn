import { motion } from "framer-motion";
import { FileText, MessageSquare, ClipboardList, User, Zap, BookOpen, Star, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Outlet, useLocation } from "react-router-dom";

const navItems = [
  { icon: BookOpen, label: "Overview", path: "/student" },
  { icon: FileText, label: "Lecture Transcript", path: "/student/transcript" },
  { icon: Zap, label: "AI Notes", path: "/student/notes" },
  { icon: ClipboardList, label: "Assignments", path: "/student/assignments" },
  { icon: MessageSquare, label: "AI Doubt Solver", path: "/student/chatbot" },
  { icon: User, label: "Profile", path: "/student/profile" },
];

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const StudentOverview = () => {
  const [latestLecture, setLatestLecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const lectures = await apiFetch("/lectures");
        if (lectures && lectures.length > 0) {
          setLatestLecture(lectures[0]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Welcome back, Student!</h1>
        <p className="text-sm text-muted-foreground mb-8">Your learning dashboard at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Credits", value: "920", icon: Star, color: "text-primary" },
          { label: "Rank", value: "#5", icon: TrendingUp, color: "text-glow-cyan" },
          { label: "Assignments", value: "3 pending", icon: ClipboardList, color: "text-secondary" },
          { label: "Notes", value: "24 saved", icon: FileText, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="float-card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Latest Lecture</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Loading latest lecture...</p>
          ) : latestLecture ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{latestLecture.title}</p>
              <p className="text-xs text-muted-foreground/60">{new Date(latestLecture.created_at).toLocaleDateString()} • {latestLecture.department}</p>
              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground leading-relaxed">
                "{latestLecture.summary?.slice(0, 150)}..."
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No lectures recorded yet.</p>
          )}
        </div>
        <div className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">Upcoming</h2>
          {["Data Structures Quiz 3 — Due tomorrow", "Graph Theory HW — Due in 3 days", "Counter Quiz: Binary Trees — Available now"].map((item, i) => (
            <div key={i} className="py-3 border-b border-border last:border-0 text-sm">{item}</div>
          ))}
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
