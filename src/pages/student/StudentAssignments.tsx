import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const assignments = [
  { title: "Data Structures Quiz 3", due: "Tomorrow", status: "pending" as const },
  { title: "Graph Theory Homework", due: "In 3 days", status: "pending" as const },
  { title: "Algorithm Analysis HW", due: "Completed", status: "completed" as const },
  { title: "Binary Trees Practice", due: "Completed", status: "completed" as const },
  { title: "Sorting Algorithms Quiz", due: "Overdue", status: "overdue" as const },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-secondary", bg: "bg-secondary/10", label: "Pending" },
  completed: { icon: CheckCircle2, color: "text-glow-cyan", bg: "bg-glow-cyan/10", label: "Completed" },
  overdue: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Overdue" },
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await apiFetch("/assignments");
        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleSubmit = async (assignmentId: string) => {
    try {
      await apiFetch("/submissions", {
        method: "POST",
        body: JSON.stringify({
          assignment_id: assignmentId,
          content: "Mock student submission content for assignment " + assignmentId
        })
      });
      toast.success("Assignment submitted successfully!");
      
      // Update local state to show completed
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId ? { ...a, status: "completed" } : a
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assignment");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Assignments</h1>
      <p className="text-sm text-muted-foreground mb-8">Your pending and completed assignments</p>

      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading assignments...</p>
      ) : assignments.length > 0 ? (
        <div className="space-y-3 max-w-2xl">
          {assignments.map((a, i) => {
            const status = a.status || "pending";
            const cfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="float-card p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-sm">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                  {status === "pending" && (
                    <button 
                      onClick={() => handleSubmit(a.id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No assignments found.</p>
      )}
    </div>
  );
};

export default StudentAssignments;
