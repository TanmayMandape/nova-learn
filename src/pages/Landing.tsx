import { motion } from "framer-motion";
import { Brain, Sparkles, BookOpen, Award } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlowButton from "@/components/GlowButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

const Landing = () => {
  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-hidden">
      <ParticleBackground />

      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg">ClassAI</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <GlowButton to="/login/student" variant="ghost">Student Login</GlowButton>
          <GlowButton to="/login/admin" variant="secondary">Faculty Login</GlowButton>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Advanced AI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-tight max-w-4xl"
        >
          <span className="gradient-text">AI Classroom</span>
          <br />
          <span className="text-foreground">Assistant</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed"
        >
          Transforming lectures into intelligent learning systems. Record, transcribe, generate notes, and solve doubts — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <GlowButton to="/login/student" variant="primary" className="text-base px-8 py-4">
            <BookOpen className="w-5 h-5" /> Login as Student
          </GlowButton>
          <GlowButton to="/login/admin" variant="secondary" className="text-base px-8 py-4">
            <Award className="w-5 h-5" /> Login as Faculty
          </GlowButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 ClassAI. Built for the future of education.
      </footer>
    </div>
  );
};

export default Landing;
