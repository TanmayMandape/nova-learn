import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, Mail, Lock, User } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Email format check — no API, no Supabase
    if (!email.includes("@") || !email.includes(".")) {
      setError("Enter a valid email address");
      return;
    }

    // Password length check
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Save to localStorage and redirect — no API call
    localStorage.setItem("user", JSON.stringify({ id: "user_1", email }));
    localStorage.setItem("userRole", isAdmin ? "faculty" : "student");
    navigate(isAdmin ? "/admin" : "/student");
  };

  return (
    <div className="min-h-screen animated-gradient-bg relative flex items-center justify-center px-4">
      <ParticleBackground />
      <div className="fixed top-1/3 left-1/3 w-80 h-80 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-secondary/8 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="glass-strong p-8 rounded-2xl glow-purple">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              {isAdmin ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Brain className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">
                {isAdmin ? "Faculty" : "Student"} Login
              </h1>
              <p className="text-xs text-muted-foreground">
                Access your {isAdmin ? "admin" : "learning"} dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <GlowButton
              type="submit"
              variant="primary"
              className="w-full justify-center py-3.5 text-base"
            >
              Sign In
            </GlowButton>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo mode — any valid email and 6+ character password
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
