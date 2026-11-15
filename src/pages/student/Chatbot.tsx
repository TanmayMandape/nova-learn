import { motion } from "framer-motion";
import { Send, Bot, User, GraduationCap, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getDemoUser, getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

interface Message {
  role: "bot" | "user";
  text: string;
  timestamp?: string;
}

const Chatbot = () => {
  const user = getDemoUser();
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: `Hello ${user?.full_name || "Student"}! I'm your AI Classroom Assistant. Ask me any doubt about lectures, course PDFs, or assignments!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch past chat history for this classroom if available
    if (activeClass && user) {
      apiFetch(`/chatbot/history?classroom_id=${activeClass.id}&student_id=${user.id}`)
        .then((logs: any[]) => {
          if (Array.isArray(logs) && logs.length > 0) {
            const formatted: Message[] = [];
            for (const log of logs.reverse()) {
              if (log.query) formatted.push({ role: "user", text: log.query, timestamp: log.timestamp });
              if (log.response) formatted.push({ role: "bot", text: log.response, timestamp: log.timestamp });
            }
            if (formatted.length > 0) {
              setMessages(formatted);
            }
          }
        })
        .catch(() => {});
    }

    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      setMessages([
        {
          role: "bot",
          text: `Switched to ${e.detail.name}. What questions do you have regarding ${e.detail.subject}?`,
        },
      ]);
    };

    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setTyping(true);

    try {
      const res = await apiFetch("/chatbot/ask", {
        method: "POST",
        body: JSON.stringify({
          question: question,
          classroom_id: activeClass?.id || null,
          student_id: user?.id || "demo-student",
        }),
      });

      const botReply = res.response || "I have analyzed your course notes, but found no direct answer.";
      setMessages((prev) => [...prev, { role: "bot", text: botReply, timestamp: res.timestamp }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I'm having trouble connecting to the AI service. Please make sure the backend server is active.",
        },
      ]);
      toast.error(err.message || "Failed to reach doubt solver API");
    } finally {
      setTyping(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> AI Doubt Solver
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Grounded in your classroom's recorded lectures, notes, and uploaded PDFs
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      <div
        className="glass-strong rounded-2xl max-w-3xl flex flex-col border border-border shadow-xl mx-auto"
        style={{ height: "calc(100vh - 240px)" }}
      >
        {/* Chat message area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "bot"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary/20 text-secondary"
                }`}
              >
                {m.role === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === "bot"
                    ? "bg-muted/40 text-foreground border border-border"
                    : "bg-primary text-primary-foreground font-medium"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.timestamp && (
                  <span className="text-[10px] opacity-60 mt-1.5 block text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-border bg-background/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about today's lecture, slides, or assignments..."
              className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all font-medium"
              disabled={typing}
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={typing || !input.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground glow-btn disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
