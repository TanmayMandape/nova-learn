import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Star, TrendingUp, Award, BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getDemoUser, getActiveClassroom } from "@/lib/auth";

const Profile = () => {
  const user = getDemoUser();
  const activeClass = getActiveClassroom();
  const [analytics, setAnalytics] = useState<any>({
    enrolled_classrooms: 0,
    available_lectures: 0,
    materials_count: 0,
    pending_assignments: 0,
    completed_assignments: 0,
    credits: 0,
    avg_score: 0,
  });

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/classrooms/analytics/student/${user.id}`)
        .then((data) => setAnalytics(data || {}))
        .catch(() => {});
    }
  }, [user?.id]);

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Classrooms",
      value: `${analytics.enrolled_classrooms} Courses`,
      pct: Math.min(100, analytics.enrolled_classrooms * 30),
    },
    {
      icon: CheckCircle2,
      label: "Assignments Completed",
      value: `${analytics.completed_assignments} Submissions`,
      pct: Math.min(100, analytics.completed_assignments * 25),
    },
    {
      icon: Award,
      label: "Assessment Average",
      value: `${analytics.avg_score}%`,
      pct: Math.min(100, Math.round(analytics.avg_score || 0)),
    },
    {
      icon: TrendingUp,
      label: "Active Credits Status",
      value: `${analytics.credits} pts`,
      pct: Math.min(100, Math.round((analytics.credits / 1000) * 100)),
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-8 tracking-tight">Student Learning Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6 max-w-4xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="float-card p-6 text-center lg:col-span-1"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary text-2xl font-bold uppercase">
            {user?.full_name ? user.full_name[0] : "S"}
          </div>
          <h2 className="font-display font-bold text-lg text-foreground">{user?.full_name || "Student"}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          {activeClass && (
            <p className="text-xs text-primary font-medium mt-1">
              Active: {activeClass.name}
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{analytics.credits}</span>
            <span className="text-xs text-muted-foreground ml-1">credits</span>
          </div>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {analytics.completed_assignments > 0 ? "Active Contributor" : "New Enrollee"}
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {stats.map((s, i) => (
            <div key={s.label} className="glass p-4 rounded-xl flex items-center gap-4 border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-medium text-muted-foreground">{s.label}</span>
                  <span className="font-bold text-foreground">{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
