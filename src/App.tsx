import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LectureRecording from "./pages/admin/LectureRecording";
import Assignments from "./pages/admin/Assignments";
import Announcements from "./pages/admin/Announcements";
import StudentCredits from "./pages/admin/StudentCredits";
import StudentDashboard from "./pages/student/StudentDashboard";
import Transcript from "./pages/student/Transcript";
import AINotes from "./pages/student/AINotes";
import StudentAssignments from "./pages/student/StudentAssignments";
import Chatbot from "./pages/student/Chatbot";
import Profile from "./pages/student/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route path="recording" element={<LectureRecording />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="credits" element={<StudentCredits />} />
          </Route>
          <Route path="/student" element={<StudentDashboard />}>
            <Route path="transcript" element={<Transcript />} />
            <Route path="notes" element={<AINotes />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
