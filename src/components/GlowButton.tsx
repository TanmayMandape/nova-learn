import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface GlowButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const GlowButton = ({ 
  children, 
  to, 
  onClick, 
  variant = "primary", 
  className = "", 
  type = "button",
  disabled = false
}: GlowButtonProps) => {
  const base = "relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 inline-flex items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground glow-btn hover:brightness-110",
    secondary: "glass border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/10",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  };

  const content = (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
};

export default GlowButton;
