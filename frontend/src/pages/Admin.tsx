import { useState } from "react";
import { LayoutDashboard, FileText, Calendar, Lock } from "lucide-react";
import AppointmentTable from "@/components/admin/AppointmentTable";
import DocumentUploader from "@/components/admin/DocumentUploader";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Tab = "appointments" | "documents";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") ?? "");
  const [tokenInput, setTokenInput] = useState("");
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem("admin_token"));
  const [tab, setTab] = useState<Tab>("appointments");

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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-8">
            <Lock className="text-violet-400" size={20} />
            <span>Admin Girişi</span>
          </div>
          <input
            type="password"
            placeholder="Admin token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 mb-4"
          />
          <Button className="w-full" onClick={handleLogin}>
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 border-r border-white/10 bg-black/30 backdrop-blur-xl flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-white font-bold text-lg flex items-center gap-2">
            <LayoutDashboard className="text-violet-400" size={18} />
            KlinikAI Admin
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "appointments" as Tab, label: "Randevular", icon: Calendar },
            { id: "documents" as Tab, label: "Bilgi Bankası", icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                tab === item.id
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="ml-60 p-8">
        <h1 className="text-2xl font-bold text-white mb-8">
          {tab === "appointments" ? "Randevu Yönetimi" : "AI Bilgi Bankası"}
        </h1>

        {tab === "appointments" && <AppointmentTable />}
        {tab === "documents" && <DocumentUploader token={token} />}
      </main>
    </div>
  );
}
