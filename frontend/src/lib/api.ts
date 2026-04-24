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
      // Hasta token'ı geçersizse logout yap; admin rotalarını atlıyoruz
      if (!url.includes("/admin") && !url.includes("/auth/login") && !url.includes("/auth/register")) {
        auth.logout();
        window.location.href = "/hasta-girisi";
      }
    }
    return Promise.reject(error);
  }
);

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
  datetime: string;
  status: string;
  note: string;
}

export interface ChatResponse {
  reply: string;
  intent?: { intent: string; [key: string]: unknown } | null;
}

export const doctorsApi = {
  list: (params?: { active_only?: boolean }) => api.get<Doctor[]>("/doctors/", { params }),
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
    datetime: string;
    note?: string;
  }) => api.post<Appointment>("/appointments/", data),
  update: (id: number, data: { status?: string; note?: string }) =>
    api.patch<Appointment>(`/appointments/${id}`, data),
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
    // Content-Type kasıtlı verilmiyor — Axios FormData için boundary'li header'ı otomatik üretir
    return api.post("/admin/upload", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  listDocuments: (token: string) =>
    api.get("/admin/documents", { headers: { Authorization: `Bearer ${token}` } }),
  deleteDocument: (id: number, token: string) =>
    api.delete(`/admin/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
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
