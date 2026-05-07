import { motion } from "framer-motion";
import { FileText, MessageSquare, ClipboardList, User, Zap, BookOpen, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Outlet, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: BookOpen, label: "Overview", path: "/student" },
  { icon: FileText, label: "Lecture Transcript", path: "/student/transcript" },
  { icon: Zap, label: "AI Notes", path: "/student/notes" },
  { icon: ClipboardList, label: "Assignments", path: "/student/assignments" },
  { icon: MessageSquare, label: "AI Doubt Solver", path: "/student/chatbot" },
  { icon: User, label: "Profile", path: "/student/profile" },
];

const ANNOUNCEMENTS = [
  {
    text: "🎯 Assignment on AI & ML is now live — attempt before Friday!",
    author: "Prof. Sharma",
    time: "2 hours ago",
    unread: true,
  },
  {
    text: "📖 Lecture notes for today's session have been uploaded to AI Notes section.",
    author: "Prof. Sharma",
    time: "5 hours ago",
    unread: true,
  },
  {
    text: "⚠️ No lecture tomorrow — self study on Neural Networks chapter 4.",
    author: "Prof. Sharma",
    time: "Yesterday",
    unread: false,
  },
];

const StudentOverview = () => {
  const navigate = useNavigate();

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Welcome back, Student!</h1>
        <p className="text-sm text-muted-foreground mb-8">Your learning dashboard at a glance</p>
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
            <button
              onClick={() => navigate("/student/notes")}
              className="mt-3 text-xs font-semibold text-primary hover:underline transition-all"
            >
              View Notes →
            </button>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">📢 Announcements</h2>
          <div className="space-y-0">
            {ANNOUNCEMENTS.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover:bg-muted/20 rounded-lg px-2 -mx-2 transition-colors cursor-default">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{
                  backgroundColor: a.unread ? "hsl(var(--primary))" : "transparent",
                  border: a.unread ? "none" : "1px solid transparent",
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.author}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{a.time}</span>
              </motion.div>
            ))}
          </div>
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
