import { getDemoUser, getActiveClassroom } from "./auth";

export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const user = getDemoUser();
  const activeClass = getActiveClassroom();

  const isFormData = options.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {};
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (user) {
    defaultHeaders["X-User-Id"] = user.id;
    defaultHeaders["X-User-Role"] = user.role;
    defaultHeaders["X-User-Email"] = user.email;
  }

  if (activeClass) {
    defaultHeaders["X-Classroom-Id"] = activeClass.id;
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const errJson = JSON.parse(text);
      msg = errJson.detail || errJson.message || text;
    } catch {
      // Keep raw text
    }
    throw new Error(msg || `Request failed with status ${res.status}`);
  }

  return res.json();
}
