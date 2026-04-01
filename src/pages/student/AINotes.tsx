import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AINotes = () => (
  <div>
    <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
      <Sparkles className="w-6 h-6 text-primary" /> AI Generated Notes
    </h1>
    <p className="text-sm text-muted-foreground mb-8">Auto-summarized from Lecture 12</p>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong p-8 rounded-xl max-w-3xl prose-invert">
      <h2 className="font-display text-lg font-semibold gradient-text mb-4">Dynamic Programming — Key Concepts</h2>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h3 className="font-display font-semibold text-base mb-2">1. Definition</h3>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">•</span> Mathematical optimization + programming method</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Developed by Richard Bellman (1950s)</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Breaks complex problems into simpler subproblems</li>
          </ul>
        </section>

        <section>
          <h3 className="font-display font-semibold text-base mb-2">2. Core Principles</h3>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex gap-2"><span className="text-secondary">•</span> <strong className="text-foreground">Optimal Substructure:</strong> Build optimal solution from sub-solutions</li>
            <li className="flex gap-2"><span className="text-secondary">•</span> <strong className="text-foreground">Overlapping Subproblems:</strong> Subproblems recur multiple times</li>
          </ul>
        </section>

        <section>
          <h3 className="font-display font-semibold text-base mb-2">3. Approaches</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="font-semibold text-foreground mb-1">Top-Down</p>
              <p className="text-xs text-muted-foreground">Memoization — cache results of recursive calls</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="font-semibold text-foreground mb-1">Bottom-Up</p>
              <p className="text-xs text-muted-foreground">Tabulation — build solution iteratively from base cases</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-display font-semibold text-base mb-2">4. Fibonacci Example</h3>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex gap-2"><span className="text-glow-cyan">•</span> Naive: O(2ⁿ) → With DP: O(n)</li>
            <li className="flex gap-2"><span className="text-glow-cyan">•</span> Store computed values to avoid redundant calculations</li>
          </ul>
        </section>
      </div>
    </motion.div>
  </div>
);

export default AINotes;
