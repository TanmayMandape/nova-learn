import { motion } from "framer-motion";
import { Send, Megaphone } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/announcements/")
      .then(data => setSent(data.announcements || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    setSending(true);
    try {
      const author = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!).email
        : "Faculty";
      const res = await apiFetch("/announcements/", {
        method: "POST",
        body: JSON.stringify({ title, message, priority, author }),
      });
      if (res.success) {
        toast.success("Announcement sent to all students!");
        setSent(prev => [res.announcement, ...prev]);
        setTitle("");
        setMessage("");
        setPriority("normal");
      } else {
        toast.error(res.error || "Failed to send");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Announcements</h1>
      <p className="text-sm text-muted-foreground mb-8">Broadcast messages to your students</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">New Announcement</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Assignment Due Friday" className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Write your announcement..." rows={4}
                className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
              <div className="flex gap-3">
                {(["normal", "urgent"] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                      priority === p
                        ? p === "urgent" ? "bg-destructive/20 text-destructive border-destructive/40" : "bg-primary/15 text-primary border-primary/30"
                        : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"
                    }`}>
                    {p === "urgent" ? "🔴 Urgent" : "🟣 Normal"}
                  </button>
                ))}
              </div>
            </div>
            <GlowButton variant="primary" type="submit" disabled={sending}>
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Announcement"}
            </GlowButton>
          </form>
        </motion.div>

        {/* Sent announcements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="font-display font-semibold">Sent Announcements</h2>
          {sent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements sent yet.</p>
          ) : sent.map((a, i) => (
            <motion.div key={a.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} className="glass p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm">{a.title}</h3>
                    {a.priority === "urgent" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium">Urgent</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                  <span className="text-xs text-muted-foreground/60 mt-1 block">
                    {a.author} • {a.created_at ? new Date(a.created_at).toLocaleString() : "just now"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Announcements;
