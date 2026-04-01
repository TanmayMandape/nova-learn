import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const Chatbot = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await apiFetch("/chatbot/history");
        // Map backend logs to frontend message format
        const formattedMessages = history.flatMap((log: any) => [
          { role: "user", text: log.query },
          { role: "bot", text: log.response }
        ]);
        
        if (formattedMessages.length === 0) {
          setMessages([{ role: "bot", text: "Hello! I'm your AI Doubt Solver. Ask me anything about today's lecture!" }]);
        } else {
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([{ role: "bot", text: "Hello! I'm your AI Doubt Solver. Ask me anything about today's lecture!" }]);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiFetch("/chatbot/ask", {
        method: "POST",
        body: JSON.stringify({ query: input })
      });

      setMessages(prev => [...prev, { role: "bot", text: response.response }]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast.error(error.message || "Failed to get AI response");
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">AI Doubt Solver</h1>
      <p className="text-sm text-muted-foreground mb-8">Ask anything from today's lecture</p>

      <div className="glass-strong rounded-xl max-w-2xl flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "bot" ? "bg-primary/20" : "bg-secondary/20"}`}>
                {m.role === "bot" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-secondary" />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-xl text-sm leading-relaxed ${m.role === "bot" ? "bg-muted/40" : "bg-primary/15"}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything from today's lecture…"
              className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground glow-btn"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
