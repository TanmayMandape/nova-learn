import { supabase } from "./supabase";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    console.error("No access token available for API request:", path);
    throw new Error("Authentication required. Please sign in again.");
  }

  // Temporary debug log
  console.log("Supabase Token:", token);

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  return res.json();
}
