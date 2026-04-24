import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Phone,
  LogOut,
  User,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { appointmentsApi, authApi, type Appointment } from "@/lib/api";
import { auth } from "@/lib/auth";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  pending: { label: "Bekliyor", icon: AlertCircle, color: "text-amber-500" },
  confirmed: { label: "Onaylandı", icon: CheckCircle, color: "text-emerald-500" },
  cancelled: { label: "İptal", icon: XCircle, color: "text-red-500" },
};

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    isPast: d < new Date(),
  };
}

export default function HastaDashboard() {
  const navigate = useNavigate();
  const patient = auth.getPatient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function handleCancel(id: number) {
    if (!confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;
    setCancellingId(id);
    try {
      await appointmentsApi.update(id, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch {
      alert("İptal işlemi başarısız oldu.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    if (!auth.isLoggedIn() || !patient) {
      navigate("/hasta-girisi");
      return;
    }
    // Token'ın backend'de hâlâ geçerli olduğunu doğrula
    authApi.me().catch(() => {
      auth.logout();
      navigate("/hasta-girisi");
    });
    appointmentsApi
      .listByPhone(patient.phone)
      .then((res) => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    auth.logout();
    navigate("/");
  }

  const upcoming = appointments.filter((a) => {
    const { isPast } = formatDateTime(a.datetime);
    return !isPast && a.status !== "cancelled";
  });
  const past = appointments.filter((a) => {
    const { isPast } = formatDateTime(a.datetime);
    return isPast || a.status === "cancelled";
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary font-manrope">
            Klinik<span className="opacity-60">AI</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-secondary hover:text-primary text-sm transition-colors"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-3xl px-6 py-5 flex items-center justify-between"
        >
          <div>
            <p className="text-primary-container text-sm mb-1">Hoş geldiniz</p>
            <h1 className="text-2xl font-extrabold text-on-primary font-manrope">
              {patient?.name}
            </h1>
            <p className="text-primary-container text-sm mt-1 flex items-center gap-1">
              <Phone size={13} />
              {patient?.phone}
            </p>
          </div>
          <div className="w-14 h-14 bg-primary-container/20 rounded-2xl flex items-center justify-center">
            <User size={26} className="text-on-primary" />
          </div>
        </motion.div>

        {/* New appointment CTA */}
        <Link to="/">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">AI ile Randevu Al</p>
                <p className="text-secondary text-xs">Chatbot ile anında randevu oluşturun</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-secondary group-hover:text-primary transition-colors" />
          </div>
        </Link>

        {/* Upcoming appointments */}
        <section>
          <h2 className="font-bold text-on-surface mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Yaklaşan Randevular
            {upcoming.length > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-secondary text-sm py-4">Yükleniyor…</div>
          ) : upcoming.length === 0 ? (
            <div className="bg-surface-variant rounded-2xl px-5 py-8 text-center text-secondary text-sm">
              Yaklaşan randevunuz bulunmuyor.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((appt) => {
                const { date, time } = formatDateTime(appt.datetime);
                const s = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = s.icon;
                return (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-on-surface text-sm">{appt.patient_name}</p>
                        <div className="flex items-center gap-3 text-secondary text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {time}
                          </span>
                        </div>
                        {appt.note && (
                          <p className="text-secondary text-xs mt-1">{appt.note}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-1 text-xs font-bold ${s.color}`}>
                          <StatusIcon size={14} />
                          {s.label}
                        </span>
                        {appt.status === "pending" || appt.status === "confirmed" ? (
                          <button
                            onClick={() => handleCancel(appt.id)}
                            disabled={cancellingId === appt.id}
                            className="text-xs text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === appt.id ? "İptal ediliyor…" : "İptal Et"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past appointments */}
        {!loading && past.length > 0 && (
          <section>
            <h2 className="font-bold text-secondary mb-3 flex items-center gap-2 text-sm">
              <Clock size={16} />
              Geçmiş Randevular
            </h2>
            <div className="flex flex-col gap-2">
              {past.slice(0, 5).map((appt) => {
                const { date, time } = formatDateTime(appt.datetime);
                const s = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                return (
                  <div
                    key={appt.id}
                    className="bg-surface-variant/50 rounded-xl px-4 py-3 flex items-center justify-between opacity-70"
                  >
                    <div className="flex items-center gap-3 text-secondary text-xs">
                      <span>{date}</span>
                      <span>{time}</span>
                    </div>
                    <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 self-start">
          <LogOut size={14} />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
