import axios from "axios";
import { auth } from "@/lib/auth";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? "";
      if (!url.includes("/admin") && !url.includes("/auth/login") && !url.includes("/auth/register")) {
        auth.logout();
        window.location.href = "/hasta-girisi";
      }
    }
    return Promise.reject(error);
  }
);

function adminHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  working_hours: Record<string, { start: string; end: string }>;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string | null;
  datetime: string;
  status: string;
  note: string;
  cancel_token?: string | null;
}

export interface ChatResponse {
  reply: string;
  intent?: { intent: string; [key: string]: unknown } | null;
}

export interface AnalyticsSummary {
  total_this_month: number;
  total_all_time: number;
  confirmed_this_month: number;
  cancelled_this_month: number;
  no_show_rate: number;
  by_status: Record<string, number>;
  by_hour: { hour: number; count: number }[];
  monthly_trend: { label: string; count: number }[];
}

// ─── API Clients ──────────────────────────────────────────────────────────────

export const doctorsApi = {
  list: (params?: { active_only?: boolean }) =>
    api.get<Doctor[]>("/doctors/", { params }),
  create: (
    data: { name: string; specialty: string; working_hours: Record<string, { start: string; end: string }>; is_active: boolean },
    token: string
  ) => api.post<Doctor>("/doctors/", data, adminHeader(token)),
  update: (
    id: number,
    data: { name?: string; specialty?: string; working_hours?: Record<string, { start: string; end: string }>; is_active?: boolean },
    token: string
  ) => api.patch<Doctor>(`/doctors/${id}`, data, adminHeader(token)),
};

export const appointmentsApi = {
  list: (params?: { start?: string; end?: string; doctor_id?: number }) =>
    api.get<Appointment[]>("/appointments/", { params }),
  listByPhone: (phone: string) =>
    api.get<Appointment[]>("/appointments/", { params: { patient_phone: phone } }),
  create: (data: {
    doctor_id: number;
    patient_name: string;
    patient_phone: string;
    patient_email?: string;
    datetime: string;
    note?: string;
  }) => api.post<Appointment>("/appointments/", data),
  update: (id: number, data: { status?: string; note?: string }) =>
    api.patch<Appointment>(`/appointments/${id}`, data),
  cancelByToken: (token: string) =>
    api.post<Appointment>(`/appointments/cancel/${token}`),
  slots: (doctor_id: number, date: string) =>
    api.get<{ slots: string[] }>("/appointments/slots", { params: { doctor_id, date } }),
};

export const chatApi = {
  send: (session_id: string, message: string) =>
    api.post<ChatResponse>("/chat/", { session_id, message }),
};

export const adminApi = {
  uploadDocument: (file: File, token: string) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/admin/upload", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  listDocuments: (token: string) =>
    api.get("/admin/documents", adminHeader(token)),
  deleteDocument: (id: number, token: string) =>
    api.delete(`/admin/documents/${id}`, adminHeader(token)),
};

export const settingsApi = {
  getPublic: () => api.get<Record<string, string>>("/settings/public"),
  get: (token: string) => api.get<Record<string, string>>("/settings/", adminHeader(token)),
  update: (data: Record<string, string>, token: string) =>
    api.patch<Record<string, string>>("/settings/", data, adminHeader(token)),
};

export const analyticsApi = {
  summary: (token: string) =>
    api.get<AnalyticsSummary>("/analytics/summary", adminHeader(token)),
};

export interface PatientToken {
  access_token: string;
  token_type: string;
  patient: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    created_at: string;
  };
}

export const authApi = {
  login: (phone: string, password: string) =>
    api.post<PatientToken>("/auth/login", { phone, password }),
  register: (data: { name: string; phone: string; email?: string; password: string }) =>
    api.post<PatientToken>("/auth/register", data),
  me: () => api.get("/auth/me"),
};

export default api;
