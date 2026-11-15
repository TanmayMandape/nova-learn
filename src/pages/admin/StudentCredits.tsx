import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp, GraduationCap, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getActiveClassroom, ClassroomInfo } from "@/lib/auth";

const medals = ["🥇", "🥈", "🥉"];

const StudentCredits = () => {
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async (classId?: string) => {
    setLoading(true);
    try {
      const url = classId
        ? `/classrooms/leaderboard/list?classroom_id=${classId}`
        : "/classrooms/leaderboard/list";
      const list = await apiFetch(url);
      setLeaderboard(Array.isArray(list) ? list : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeClass?.id);

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      fetchLeaderboard(e.detail?.id);
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Student Credits & Ranks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time classroom leaderboard computed from quiz submissions, attendance, and scores
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
          Calculating student standings...
        </p>
      )}

      {!loading && leaderboard.length === 0 && (
        <div className="glass p-12 rounded-2xl text-center max-w-xl mx-auto border border-dashed border-border">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-sm">No Student Submissions Recorded</h3>
          <p className="text-xs text-muted-foreground mt-1">
            As enrolled students join your classroom and submit assignments, their scores and accumulated credits will rank here automatically.
          </p>
        </div>
      )}

      {!loading && leaderboard.length > 0 && (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {leaderboard.slice(0, 3).map((s, i) => (
              <motion.div
                key={s.student_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="float-card p-6 text-center"
              >
                <span className="text-3xl">{medals[i]}</span>
                <p className="font-display font-semibold text-base mt-2">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.email}</p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-xl font-bold text-primary">{s.credits}</span>
                  <span className="text-xs text-muted-foreground">credits</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Avg. Score: <strong className="text-foreground">{s.avg_score}%</strong> ({s.submissions} quizzes)
                </p>
              </motion.div>
            ))}
          </div>

          {/* Full List */}
          <div className="glass p-6 rounded-2xl border border-border">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Full Classroom Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.map((s, i) => (
                <motion.div
                  key={s.student_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/30 border border-border/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-mono font-bold text-muted-foreground text-right">
                      #{s.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold uppercase shrink-0">
                      {s.name[0]}
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-bold text-foreground text-sm block">{s.credits} pts</span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.submissions} submitted • {s.avg_score}% avg
                      </span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-glow-cyan" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCredits;
