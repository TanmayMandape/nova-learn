import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp } from "lucide-react";

const students = [
  { name: "Alice Johnson", credits: 1240, rank: 1 },
  { name: "Bob Smith", credits: 1180, rank: 2 },
  { name: "Carol Williams", credits: 1050, rank: 3 },
  { name: "David Brown", credits: 980, rank: 4 },
  { name: "Eva Davis", credits: 920, rank: 5 },
  { name: "Frank Miller", credits: 870, rank: 6 },
  { name: "Grace Wilson", credits: 810, rank: 7 },
  { name: "Henry Moore", credits: 750, rank: 8 },
];

const medals = ["🥇", "🥈", "🥉"];

const StudentCredits = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-1">Student Credits</h1>
    <p className="text-sm text-muted-foreground mb-8">Leaderboard and credit management</p>

    {/* Top 3 */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {students.slice(0, 3).map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="float-card p-6 text-center"
        >
          <span className="text-3xl">{medals[i]}</span>
          <p className="font-display font-semibold mt-2">{s.name}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-primary">{s.credits}</span>
          </div>
          <span className="text-xs text-muted-foreground">credits</span>
        </motion.div>
      ))}
    </div>

    {/* Full list */}
    <div className="glass p-6 rounded-xl">
      <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" /> Full Leaderboard
      </h2>
      <div className="space-y-2">
        {students.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-sm font-mono text-muted-foreground text-right">#{s.rank}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {s.name[0]}
              </div>
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{s.credits}</span>
              <TrendingUp className="w-3.5 h-3.5 text-glow-cyan" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default StudentCredits;
