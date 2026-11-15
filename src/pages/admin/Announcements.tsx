import { motion } from "framer-motion";
import { Send, Megaphone, GraduationCap } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getDemoUser, getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all";

const Announcements = () => {
  const user = getDemoUser();
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<any[]>([]);

  const fetchAnnouncements = async (classId?: string) => {
    try {
      const url = classId ? `/announcements/?classroom_id=${classId}` : "/announcements/";
      const data = await apiFetch(url);
      setSent(data.announcements || []);
    } catch {}
  };

  useEffect(() => {
    fetchAnnouncements(activeClass?.id);

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      fetchAnnouncements(e.detail?.id);
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const author = user?.full_name || "Faculty";
      const res = await apiFetch("/announcements/", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          author,
          classroom_id: activeClass?.id || null,
        }),
      });
      if (res.success) {
        toast.success(`Announcement broadcast to ${activeClass ? activeClass.name : "all students"}!`);
        setSent((prev) => [res.announcement, ...prev]);
        setTitle("");
        setMessage("");
      } else {
        toast.error("Failed to send");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Classroom Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Broadcast messages and reminders directly to your enrolled students
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong p-6 rounded-2xl border border-border"
        >
          <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> New Broadcast Message
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Review Session or Assignment Deadline"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement details here..."
                rows={4}
                className={`${inputClass} resize-none`}
                required
              />
            </div>
            <GlowButton variant="primary" type="submit" disabled={sending}>
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Announcement"}
            </GlowButton>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="font-display font-semibold text-base mb-1">Broadcast History</h2>
          {sent.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center glass rounded-xl">
              No announcements sent yet for this classroom.
            </p>
          ) : (
            sent.map((a, i) => (
              <motion.div
                key={a.id || i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-4 rounded-xl border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs text-foreground">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                      {a.author} • {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Announcements;
