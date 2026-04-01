import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, Mail, Lock, User } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
  const { role: initialRole } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isAdminPath = initialRole === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify profile and get role from backend
      const userProfile = await apiFetch("/auth/user");
      const userRole = userProfile.role;

      toast.success(`Welcome back, ${userProfile.full_name || 'User'}!`);

      // Navigate based on actual role from database
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
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
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="glass-strong p-8 rounded-2xl glow-purple">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              {isAdminPath ? <User className="w-5 h-5 text-primary" /> : <Brain className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">{isAdminPath ? "Faculty" : "Student"} Login</h1>
              <p className="text-xs text-muted-foreground">Access your {isAdminPath ? "admin" : "learning"} dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <GlowButton 
              type="submit" 
              variant="primary" 
              className="w-full justify-center py-3.5 text-base"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </GlowButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
