import { motion } from "framer-motion";

const transcript = [
  { time: "0:00", text: "Welcome to today's lecture on Dynamic Programming. Let's start with the fundamentals.", highlight: false },
  { time: "0:45", text: "Dynamic programming is both a mathematical optimization method and a computer programming method.", highlight: true },
  { time: "1:30", text: "The method was developed by Richard Bellman in the 1950s and has found applications in numerous fields.", highlight: false },
  { time: "2:15", text: "The key concept is optimal substructure — an optimal solution can be constructed from optimal solutions of its subproblems.", highlight: true },
  { time: "3:00", text: "There are two main approaches: top-down with memoization, and bottom-up with tabulation.", highlight: true },
  { time: "3:45", text: "Let's look at a classic example: the Fibonacci sequence. The naive recursive approach has exponential time complexity.", highlight: false },
  { time: "4:30", text: "By storing previously computed values, we reduce this to linear time — O(n). This is the power of memoization.", highlight: true },
  { time: "5:15", text: "Another important concept is overlapping subproblems. If a problem can be broken into subproblems that recur, DP is applicable.", highlight: false },
];

const Transcript = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-1">Lecture Transcript</h1>
    <p className="text-sm text-muted-foreground mb-8">Advanced Algorithms — Lecture 12</p>

    <div className="glass-strong p-6 rounded-xl max-w-3xl">
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {transcript.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex gap-4 p-3 rounded-lg transition-colors ${line.highlight ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/30"}`}
          >
            <span className="text-xs text-muted-foreground font-mono w-10 shrink-0 pt-0.5">{line.time}</span>
            <p className="text-sm leading-relaxed">{line.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Transcript;
