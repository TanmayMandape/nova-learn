import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setDemoUser } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isAdmin = role === "admin" || role === "faculty";
  const [email, setEmail] = useState(isAdmin ? "teacher@gmail.com" : "student@gmail.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Email format check
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    // Password must be non-empty
    if (!password.trim()) {
      setError("Password cannot be empty");
      return;
    }

    setLoading(true);
    const selectedRole = isAdmin ? "faculty" : "student";

    try {
      // Authenticate with demo login API
      const profile = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          role: selectedRole
        })
      });

      setDemoUser(profile);
      toast.success(`Welcome back, ${profile.full_name}!`);
      navigate(isAdmin ? "/admin" : "/student");
    } catch (err: any) {
      // Fallback local demo user session if backend is temporarily starting up
      const fallbackId = `${isAdmin ? "fac" : "stu"}_${Math.random().toString(36).slice(2, 8)}`;
      const username = email.split("@")[0].replace(".", " ").replace("_", " ").toUpperCase();
      const profile = {
        id: fallbackId,
        email: email.trim().toLowerCase(),
        full_name: isAdmin ? `Prof. ${username}` : username,
        role: selectedRole as "faculty" | "student"
      };
      setDemoUser(profile);
      toast.success(`Welcome, ${profile.full_name}! (Demo Mode)`);
      navigate(isAdmin ? "/admin" : "/student");
    } finally {
      setLoading(false);
    }
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

        <div className="glass-strong p-8 rounded-2xl glow-purple border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              {isAdmin ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Brain className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">
                {isAdmin ? "Faculty" : "Student"} Demo Login
              </h1>
              <p className="text-xs text-muted-foreground">
                Enter any valid email and password to explore
              </p>
            </div>
          </div>

          <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>Demo Mode:</strong> Any valid email + any password will sign you in as{" "}
              <strong className="text-primary">{isAdmin ? "Faculty" : "Student"}</strong>.
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? "teacher@gmail.com" : "student@gmail.com"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password (any)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <GlowButton
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full justify-center py-3"
              >
                {loading ? "Signing in..." : `Sign In as ${isAdmin ? "Faculty" : "Student"}`}
              </GlowButton>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Switch Role:</span>
            <button
              onClick={() => navigate(isAdmin ? "/login/student" : "/login/admin")}
              className="text-primary hover:underline font-medium"
            >
              Log in as {isAdmin ? "Student" : "Faculty"} →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
