import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { appointmentsApi, doctorsApi, type Appointment, type Doctor } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Bekliyor", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
  confirmed: { label: "Onaylandı", color: "text-green-400 bg-green-400/10", icon: CheckCircle },
  cancelled: { label: "İptal", color: "text-rose-400 bg-rose-400/10", icon: XCircle },
};

export default function AppointmentTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorMap, setDoctorMap] = useState<Record<number, Doctor>>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: number, status: string) {
    await appointmentsApi.update(id, { status });
    load();
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Randevular</h3>
        <button
          onClick={load}
          className="text-slate-400 hover:text-white transition-colors"
          title="Yenile"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/2">
              {["Hasta", "Telefon", "Doktor", "Tarih & Saat", "Durum", "İşlemler"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-slate-400 font-medium text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Henüz randevu yok.
                </td>
              </tr>
            )}
            {appointments.map((a) => {
              const s = STATUS_LABELS[a.status] ?? STATUS_LABELS.pending;
              return (
                <tr key={a.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-white">{a.patient_name}</td>
                  <td className="px-6 py-4 text-slate-400">{a.patient_phone}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {doctorMap[a.doctor_id]?.name ?? `#${a.doctor_id}`}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(a.datetime).toLocaleString("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", s.color)}>
                      <s.icon size={11} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.status !== "confirmed" && (
                        <button
                          onClick={() => updateStatus(a.id, "confirmed")}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Onayla
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button
                          onClick={() => updateStatus(a.id, "cancelled")}
                          className="text-xs text-rose-400 hover:text-rose-300"
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
