import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const DEMO_QA: Record<string, string> = {
  "supervised learning": "Supervised learning is where the model learns from labeled data to predict outcomes on new data.",
  "overfitting": "Overfitting occurs when a model performs well on training data but poorly on new unseen data.",
  "gradient descent": "Gradient descent is an optimization algorithm used to minimize the loss function during training.",
  "what did we learn": "Today we covered AI and ML fundamentals including supervised learning, neural networks, gradient descent, backpropagation, overfitting, NLP and computer vision.",
  "neural network": "Neural networks are computational models inspired by the biological structure of the human brain, consisting of layers of interconnected nodes.",
  "backpropagation": "Backpropagation is the method used to calculate gradients and update the weights of a neural network during training.",
  "cross-validation": "Cross-validation is a technique used to evaluate how well a model generalizes to independent datasets.",
  "nlp": "Natural Language Processing (NLP) enables machines to understand and process human language. It was introduced as a major application of deep learning.",
  "computer vision": "Computer vision is an AI field focused on enabling machines to interpret and understand images and videos.",
  "underfitting": "Underfitting occurs when a model is too simple to capture the underlying patterns in the data.",
};

function getAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_QA)) {
    if (lower.includes(key)) return val;
  }
  return "This topic was not covered in today's lecture. Please ask your teacher for more details.";
}

const INITIAL_MESSAGES = [
  { role: "bot" as const, text: "Hello! I'm your AI Doubt Solver. Ask me anything about today's lecture on AI & Machine Learning!" },
];

const Chatbot = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    if (!input.trim() || typing) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: getAnswer(question) }]);
    }, 1000);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">AI Doubt Solver</h1>
      <p className="text-sm text-muted-foreground mb-8">Ask anything from today's lecture</p>

      <div className="glass-strong rounded-xl max-w-2xl flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "bot" ? "bg-primary/20" : "bg-secondary/20"}`}>
                {m.role === "bot" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-secondary" />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-xl text-sm leading-relaxed ${m.role === "bot" ? "bg-muted/40" : "bg-primary/15"}`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="p-3 rounded-xl bg-muted/40 flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/60"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything from today's lecture…"
              className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
              disabled={typing} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={send} disabled={typing}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground glow-btn disabled:opacity-50">
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
