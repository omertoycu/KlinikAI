import { useState } from "react";
import {
  LayoutDashboard, FileText, Calendar, Lock, Users,
  Settings, BarChart2, CalendarDays,
} from "lucide-react";
import AppointmentTable from "@/components/admin/AppointmentTable";
import AppointmentCalendar from "@/components/admin/AppointmentCalendar";
import DocumentUploader from "@/components/admin/DocumentUploader";
import DoctorManager from "@/components/admin/DoctorManager";
import ClinicSettings from "@/components/admin/ClinicSettings";
import Analytics from "@/components/admin/Analytics";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Tab = "calendar" | "appointments" | "doctors" | "analytics" | "documents" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: "calendar",     label: "Takvim",       icon: CalendarDays },
  { id: "appointments", label: "Randevular",    icon: Calendar },
  { id: "doctors",      label: "Doktorlar",     icon: Users },
  { id: "analytics",   label: "Analitik",       icon: BarChart2 },
  { id: "documents",   label: "Bilgi Bankası",  icon: FileText },
  { id: "settings",    label: "Ayarlar",        icon: Settings },
];

const PAGE_TITLES: Record<Tab, string> = {
  calendar:     "Randevu Takvimi",
  appointments: "Randevu Listesi",
  doctors:      "Doktor Yönetimi",
  analytics:    "Analitik",
  documents:    "AI Bilgi Bankası",
  settings:     "Klinik Ayarları",
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") ?? "");
  const [tokenInput, setTokenInput] = useState("");
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem("admin_token"));
  const [tab, setTab] = useState<Tab>("calendar");

  function handleLogin() {
    if (!tokenInput.trim()) return;
    localStorage.setItem("admin_token", tokenInput.trim());
    setToken(tokenInput.trim());
    setAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    setToken("");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <Lock size={16} />
            </div>
            <span className="font-bold text-on-background text-xl font-manrope">Admin Girişi</span>
          </div>
          <p className="text-secondary text-sm mb-6">Devam etmek için admin tokeninizi girin.</p>
          <input
            type="password"
            placeholder="Admin token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary mb-4 transition-colors"
          />
          <Button className="w-full" onClick={handleLogin}>
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 border-r border-outline-variant bg-surface-container-lowest flex flex-col">
        <div className="px-6 py-5 border-b border-outline-variant">
          <div className="text-primary font-bold text-lg flex items-center gap-2 font-manrope">
            <LayoutDashboard size={18} className="text-primary" />
            Klinik<span className="opacity-60">AI</span>
          </div>
          <p className="text-secondary text-xs mt-0.5">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-primary-container text-on-primary-container border border-primary/20"
                  : "text-secondary hover:text-primary hover:bg-surface-container"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <Button variant="ghost" size="sm" className="w-full text-secondary hover:text-on-surface" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="ml-60 p-8">
        <h1 className="text-2xl font-bold text-on-background mb-8 font-manrope">{PAGE_TITLES[tab]}</h1>

        {tab === "calendar"     && <AppointmentCalendar />}
        {tab === "appointments" && <AppointmentTable />}
        {tab === "doctors"      && <DoctorManager token={token} />}
        {tab === "analytics"    && <Analytics token={token} />}
        {tab === "documents"    && <DocumentUploader token={token} />}
        {tab === "settings"     && <ClinicSettings token={token} />}
      </main>
    </div>
  );
}
