import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  Plus,
  BookOpen,
  Copy,
  Check,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import {
  getDemoUser,
  clearDemoUser,
  getActiveClassroom,
  setActiveClassroom,
  ClassroomInfo,
} from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  items: NavItem[];
  role: "admin" | "student";
}

const DashboardLayout = ({ children, items, role }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([]);
  const [activeClass, setActiveClassState] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = getDemoUser() || {
    id: role === "admin" ? "fac_demo" : "stu_demo",
    email: role === "admin" ? "teacher@gmail.com" : "student@gmail.com",
    full_name: role === "admin" ? "Prof. Teacher" : "Student Demo",
    role: role === "admin" ? "faculty" : "student",
  };

  const isFaculty = role === "admin";

  const fetchClassrooms = async () => {
    try {
      if (isFaculty) {
        const data = await apiFetch(`/classrooms/?faculty_id=${user.id}`);
        const list: ClassroomInfo[] = Array.isArray(data) ? data : [];
        setClassrooms(list);
        if (list.length > 0) {
          const current = getActiveClassroom();
          const match = list.find((c) => c.id === current?.id);
          const chosen = match || list[0];
          setActiveClassState(chosen);
          setActiveClassroom(chosen);
        }
      } else {
        const data = await apiFetch(`/classrooms/enrolled/${user.id}`);
        const list: ClassroomInfo[] = Array.isArray(data) ? data : [];
        setClassrooms(list);
        if (list.length > 0) {
          const current = getActiveClassroom();
          const match = list.find((c) => c.id === current?.id);
          const chosen = match || list[0];
          setActiveClassState(chosen);
          setActiveClassroom(chosen);
        }
      }
    } catch (err) {
      console.warn("Could not fetch classrooms:", err);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user.id, isFaculty]);

  const handleSelectClassroom = (c: ClassroomInfo) => {
    setActiveClassState(c);
    setActiveClassroom(c);
    toast.success(`Switched to ${c.name}`);
    // Trigger custom event so page components can refetch
    window.dispatchEvent(new CustomEvent("classroomChanged", { detail: c }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Classroom code copied: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    clearDemoUser();
    toast.info("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 250 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-sidebar shadow-md"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 shadow-sm">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <span className="font-display font-bold text-base tracking-tight gradient-text">
                  ClassAI
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground block -mt-1">
                  {isFaculty ? "Faculty Portal" : "Student Hub"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Info Capsule */}
        {!collapsed ? (
          <div className="px-3 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {user.full_name[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium uppercase">
                {isFaculty ? "Faculty" : "Student"}
              </span>
            </div>
          </div>
        ) : null}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-2.5 border-t border-border space-y-1 bg-background/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Container */}
      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 250 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Top Bar with Active Classroom Context */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            {classrooms.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Classroom:</span>
                <select
                  value={activeClass?.id || ""}
                  onChange={(e) => {
                    const found = classrooms.find((c) => c.id === e.target.value);
                    if (found) handleSelectClassroom(found);
                  }}
                  className="bg-muted/50 border border-border text-foreground text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary transition-all cursor-pointer"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id} className="bg-background text-foreground">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                {activeClass?.code && (
                  <button
                    onClick={() => handleCopyCode(activeClass.code)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono font-bold border border-primary/20 transition-all ml-1"
                    title="Click to copy join code"
                  >
                    <span>Code: {activeClass.code}</span>
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {isFaculty
                    ? "No classrooms created yet. Create your first classroom below!"
                    : "No classrooms enrolled yet. Join a classroom using your teacher's code!"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Demo Session Active</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
