export interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: "faculty" | "student" | "admin";
}

export interface ClassroomInfo {
  id: string;
  name: string;
  code: string;
  subject: string;
  description?: string;
  faculty_id: string;
  faculty_email?: string;
  created_at?: string;
}

const USER_KEY = "classai_demo_user";
const ACTIVE_CLASS_KEY = "classai_active_classroom";

export function getDemoUser(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setDemoUser(user: DemoUser) {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also set legacy user key for backward compatibility
    localStorage.setItem("user", JSON.stringify({ id: user.id, email: user.email }));
    localStorage.setItem("userRole", user.role);
  } catch (e) {
    console.error("Failed to save demo user session:", e);
  }
}

export function clearDemoUser() {
  try {
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACTIVE_CLASS_KEY);
    localStorage.removeItem(ACTIVE_CLASS_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  } catch (e) {
    console.error("Failed to clear demo user session:", e);
  }
}

export function getActiveClassroom(): ClassroomInfo | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_CLASS_KEY) || localStorage.getItem(ACTIVE_CLASS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveClassroom(classroom: ClassroomInfo | null) {
  try {
    if (!classroom) {
      sessionStorage.removeItem(ACTIVE_CLASS_KEY);
      localStorage.removeItem(ACTIVE_CLASS_KEY);
    } else {
      sessionStorage.setItem(ACTIVE_CLASS_KEY, JSON.stringify(classroom));
      localStorage.setItem(ACTIVE_CLASS_KEY, JSON.stringify(classroom));
    }
  } catch (e) {
    console.error("Failed to save active classroom:", e);
  }
}
