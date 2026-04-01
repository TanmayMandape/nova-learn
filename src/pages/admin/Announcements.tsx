import { motion } from "framer-motion";
import { Send, Megaphone } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";

const announcements = [
  { title: "Mid-term schedule updated", body: "Please check the new exam dates on the portal.", time: "2 hrs ago" },
  { title: "Guest lecture on Friday", body: "Dr. Smith will be speaking about ML in healthcare.", time: "1 day ago" },
  { title: "Assignment deadline extended", body: "HW3 deadline moved to next Monday.", time: "3 days ago" },
];

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Announcements</h1>
      <p className="text-sm text-muted-foreground mb-8">Broadcast messages to your students</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-6 rounded-xl">
          <h2 className="font-display font-semibold mb-4">New Announcement</h2>
          <form className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title..." className={inputClass} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement..." rows={4} className={`${inputClass} resize-none`} />
            <GlowButton variant="primary" type="submit"><Send className="w-4 h-4" /> Publish</GlowButton>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="glass p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
                  <span className="text-xs text-muted-foreground/60 mt-2 block">{a.time}</span>
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
