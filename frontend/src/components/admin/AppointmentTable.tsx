import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { appointmentsApi, doctorsApi, type Appointment, type Doctor } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  pending:   { label: "Bekliyor",  cls: "text-amber-700 bg-amber-50 border border-amber-200",   icon: Clock        },
  confirmed: { label: "Onaylandı", cls: "text-green-700 bg-green-50 border border-green-200",   icon: CheckCircle  },
  cancelled: { label: "İptal",     cls: "text-rose-600  bg-rose-50  border border-rose-200",    icon: XCircle      },
};

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorMap,    setDoctorMap]    = useState<Record<number, Doctor>>({});
  const [loading,      setLoading]      = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.all([
        appointmentsApi.list(),
        doctorsApi.list({ active_only: false }),
      ]);
      setAppointments(apptRes.data);
      const map: Record<number, Doctor> = {};
      for (const d of docRes.data) map[d.id] = d;
      setDoctorMap(map);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await appointmentsApi.update(id, { status });
    load();
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
        <div>
          <h3 className="text-on-background font-semibold">Tüm Randevular</h3>
          <p className="text-secondary text-xs mt-0.5">{appointments.length} kayıt</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-secondary hover:text-primary border border-outline-variant hover:border-primary/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          title="Yenile"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              {["Hasta", "Telefon", "Doktor", "Tarih & Saat", "Durum", "İşlemler"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-secondary font-semibold text-xs uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {appointments.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-secondary text-sm">
                  Henüz randevu yok.
                </td>
              </tr>
            )}
            {loading && appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-secondary text-sm animate-pulse">
                  Yükleniyor…
                </td>
              </tr>
            )}
            {appointments.map((a) => {
              const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.pending;
              return (
                <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium text-on-background">{a.patient_name}</td>
                  <td className="px-6 py-4 text-secondary">{a.patient_phone}</td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {doctorMap[a.doctor_id]?.name ?? `#${a.doctor_id}`}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant tabular-nums">
                    {new Date(a.datetime).toLocaleString("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", s.cls)}>
                      <s.icon size={11} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.status !== "confirmed" && (
                        <button
                          onClick={() => updateStatus(a.id, "confirmed")}
                          className="text-xs font-semibold text-green-700 hover:text-green-800 underline-offset-2 hover:underline transition-colors"
                        >
                          Onayla
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button
                          onClick={() => updateStatus(a.id, "cancelled")}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline-offset-2 hover:underline transition-colors"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
