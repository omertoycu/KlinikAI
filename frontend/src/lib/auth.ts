export interface PatientInfo {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  created_at: string;
}

const TOKEN_KEY = "hasta_token";
const PATIENT_KEY = "hasta_info";

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setSession: (token: string, patient: PatientInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
  },

  getPatient: (): PatientInfo | null => {
    const raw = localStorage.getItem(PATIENT_KEY);
    return raw ? (JSON.parse(raw) as PatientInfo) : null;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PATIENT_KEY);
  },

  isLoggedIn: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
