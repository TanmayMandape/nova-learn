import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  GraduationCap,
  Calendar,
  Clock,
  User,
  Filter,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { apiFetch } from "@/lib/api";
import {
  getDemoUser,
  getActiveClassroom,
  setActiveClassroom,
  ClassroomInfo,
} from "@/lib/auth";
import { toast } from "sonner";

interface AnnouncementItem {
  id: string;
  classroom_id?: string;
  classroom_name?: string;
  classroom_code?: string;
  classroom_subject?: string;
  title: string;
  message: string;
  author: string;
  created_at: string;
}

const isRecentAnnouncement = (dateStr: string): boolean => {
  try {
    const timestamp = new Date(dateStr).getTime();
    const hoursDifference = (Date.now() - timestamp) / (1000 * 60 * 60);
    return hoursDifference < 48;
  } catch {
    return false;
  }
};

const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
};

const StudentAnnouncements = () => {
  const user = getDemoUser();
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("all");
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrolledClassrooms = async () => {
    if (!user) return;
    try {
      const data = await apiFetch(`/classrooms/enrolled/${user.id}`);
      const list = Array.isArray(data) ? data : [];
      setClassrooms(list);
    } catch (err) {
      console.warn("Failed to load enrolled classrooms:", err);
    }
  };

  const fetchAnnouncements = async (classId?: string) => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const targetClass = classId && classId !== "all" ? classId : undefined;
      const url = targetClass
        ? `/announcements/?student_id=${user.id}&classroom_id=${targetClass}`
        : `/announcements/?student_id=${user.id}`;
      const data = await apiFetch(url);
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      console.error("Failed to fetch announcements:", err);
      setError(err.message || "Failed to load classroom announcements.");
      toast.error("Could not load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledClassrooms();
    const active = getActiveClassroom();
    if (active) {
      setSelectedClassroomId(active.id);
      fetchAnnouncements(active.id);
    } else {
      fetchAnnouncements("all");
    }

    const handleClassChange = (e: any) => {
      const newClass = e.detail;
      if (newClass?.id) {
        setSelectedClassroomId(newClass.id);
        fetchAnnouncements(newClass.id);
      } else {
        setSelectedClassroomId("all");
        fetchAnnouncements("all");
      }
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [user?.id]);

  const handleFilterChange = (classId: string) => {
    setSelectedClassroomId(classId);
    if (classId !== "all") {
      const selected = classrooms.find((c) => c.id === classId);
      if (selected) {
        setActiveClassroom(selected);
        window.dispatchEvent(new CustomEvent("classroomChanged", { detail: selected }));
      }
    }
    fetchAnnouncements(classId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Classroom Announcements</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
              {announcements.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Important updates, reminders, and broadcast notices from your course instructors
          </p>
        </div>

        {/* Filter by Enrolled Classroom */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Course:</span>
            <select
              value={selectedClassroomId}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-background text-foreground">
                All Enrolled Classrooms ({classrooms.length})
              </option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id} className="bg-background text-foreground">
                  {c.name} {c.code ? `(${c.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchAnnouncements(selectedClassroomId)}
            className="p-2.5 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-3 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAnnouncements(selectedClassroomId)}
            className="font-semibold underline hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass p-5 rounded-2xl border border-border animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-48 bg-muted/60 rounded" />
                <div className="h-4 w-24 bg-muted/40 rounded" />
              </div>
              <div className="h-3 w-full bg-muted/30 rounded" />
              <div className="h-3 w-4/5 bg-muted/30 rounded" />
              <div className="h-3 w-32 bg-muted/40 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && announcements.length === 0 && (
        <div className="glass-strong p-12 rounded-2xl border border-border text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="font-display font-semibold text-base mb-1">No Announcements Yet</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {selectedClassroomId !== "all"
              ? "Your instructor has not posted any broadcasts for this classroom yet."
              : classrooms.length === 0
              ? "You haven't enrolled in any classrooms yet. Join a classroom with a join code to receive course updates."
              : "No announcements have been broadcast in any of your enrolled classrooms."}
          </p>
          <GlowButton
            variant="secondary"
            onClick={() => fetchAnnouncements(selectedClassroomId)}
            className="mx-auto text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check for New Broadcasts
          </GlowButton>
        </div>
      )}

      {/* Announcements List */}
      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {announcements.map((item, index) => {
              const recent = isRecentAnnouncement(item.created_at);
              const formattedDate = new Date(item.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const timeAgo = formatTimeAgo(item.created_at);

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`glass p-6 rounded-2xl border transition-all ${
                    recent
                      ? "border-primary/40 shadow-lg shadow-primary/5 bg-gradient-to-r from-primary/5 via-transparent to-transparent"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <h2 className="font-display font-semibold text-base text-foreground">
                        {item.title}
                      </h2>
                      {recent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    {/* Classroom Badge */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {item.classroom_name ? (
                        <span className="px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-medium flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {item.classroom_name}
                          {item.classroom_code ? ` • ${item.classroom_code}` : ""}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">
                          General Announcement
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="pl-0 sm:pl-10.5">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {item.message}
                    </div>

                    {/* Footer Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-foreground/80 font-medium">
                          <User className="w-3.5 h-3.5 text-primary" />
                          {item.author || "Faculty"}
                        </span>
                        <span>•</span>
                        <span className="text-muted-foreground/70">Instructor</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground/60" />
                          {formattedDate}
                        </span>
                        {timeAgo && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary/80 font-medium">
                              <Clock className="w-3 h-3" />
                              {timeAgo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;