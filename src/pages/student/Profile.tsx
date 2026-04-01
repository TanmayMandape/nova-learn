import { motion } from "framer-motion";
import { User, Star, TrendingUp, Award, BookOpen, CheckCircle2 } from "lucide-react";

const Profile = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-8">Student Profile</h1>

    <div className="grid lg:grid-cols-3 gap-6 max-w-4xl">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="float-card p-6 text-center lg:col-span-1">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display font-bold text-lg">Eva Davis</h2>
        <p className="text-sm text-muted-foreground">CS301 — Computer Science</p>
        <div className="mt-4 flex items-center justify-center gap-1">
          <Star className="w-5 h-5 text-primary" />
          <span className="text-xl font-bold text-primary">920</span>
          <span className="text-sm text-muted-foreground ml-1">credits</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Rank #5 in class</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
        {[
          { icon: BookOpen, label: "Lectures Attended", value: "42 / 48", pct: 87 },
          { icon: CheckCircle2, label: "Assignments Completed", value: "18 / 21", pct: 86 },
          { icon: Award, label: "Quiz Average", value: "87%", pct: 87 },
          { icon: TrendingUp, label: "Overall Performance", value: "A", pct: 92 },
        ].map((s, i) => (
          <div key={s.label} className="glass p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-sm font-semibold">{s.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
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

export default Profile;
