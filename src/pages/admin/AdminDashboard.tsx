import { motion } from "framer-motion";
import { LayoutDashboard, Mic, ClipboardList, Megaphone, Users, TrendingUp, BookOpen, Award } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Outlet, useLocation } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Mic, label: "Lecture Recording", path: "/admin/recording" },
  { icon: ClipboardList, label: "Assignments", path: "/admin/assignments" },
  { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
  { icon: Users, label: "Student Credits", path: "/admin/credits" },
];

const stats = [
  { label: "Total Students", value: "12", icon: Users, trend: "+2" },
  { label: "Active Lectures", value: "1", icon: BookOpen, trend: "+1" },
  { label: "Assignments", value: "1", icon: ClipboardList, trend: "+1" },
  { label: "Avg. Score", value: "78%", icon: Award, trend: "+2.4%" },
];

const AdminOverview = () => (
  <div>
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-display text-2xl font-bold mb-1">Faculty Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">Welcome back! Here's your classroom overview.</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="float-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" />
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

    {/* Recent Activity */}
    <div className="glass p-6 rounded-xl">
      <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {[
          { text: "Lecture recorded: AI & ML Fundamentals — transcription completed", time: "Today" },
          { text: "Assignment generated: 10 questions (5 MCQ + 5 Short Answer)", time: "Today" },
          { text: "12 students viewed the lecture notes", time: "Today" },
          { text: "AI notes auto-generated from lecture transcript", time: "Today" },
        ].map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <span className="text-sm">{a.text}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{a.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

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
