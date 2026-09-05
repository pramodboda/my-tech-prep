import type { AuthResponse, Technology, Topic, Question } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  return localStorage.getItem("techprep_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getTechnologies: () => request<Technology[]>("/technologies"),

  createTechnology: (name: string) =>
    request<Technology>("/technologies", { method: "POST", body: JSON.stringify({ name }) }),

  deleteTechnology: (id: string) => request<void>(`/technologies/${id}`, { method: "DELETE" }),

  createTopic: (technologyId: string, name: string) =>
    request<Topic>("/topics", { method: "POST", body: JSON.stringify({ technologyId, name }) }),

  deleteTopic: (id: string) => request<void>(`/topics/${id}`, { method: "DELETE" }),

  createQuestion: (topicId: string) =>
    request<Question>("/questions", { method: "POST", body: JSON.stringify({ topicId, question: "" }) }),

  updateQuestion: (id: string, data: Partial<Pick<Question, "question" | "deepAnswer" | "shortAnswer">>) =>
    request<Question>(`/questions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteQuestion: (id: string) => request<void>(`/questions/${id}`, { method: "DELETE" }),
};
