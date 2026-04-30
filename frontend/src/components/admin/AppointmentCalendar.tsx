import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { appointmentsApi, doctorsApi, type Appointment, type Doctor } from "@/lib/api";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const HOUR_H = 64;

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-amber-50 border-amber-300 text-amber-800",
  confirmed: "bg-green-50 border-green-300 text-green-800",
  cancelled: "bg-rose-50  border-rose-200  text-rose-400 line-through opacity-60",
};

const STATUS_DOT: Record<string, string> = {
  pending:   "bg-amber-400",
  confirmed: "bg-green-500",
  cancelled: "bg-rose-400",
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const DAY_LABELS  = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

export default function AppointmentCalendar() {
  const [weekStart, setWeekStart]     = useState(() => getMonday(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorMap, setDoctorMap]     = useState<Record<number, Doctor>>({});
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Appointment | null>(null);

  const weekEnd  = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const start = weekStart.toISOString().split("T")[0];
        const end   = weekEnd.toISOString().split("T")[0];
        const [apptRes, docRes] = await Promise.all([
          appointmentsApi.list({ start, end }),
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
    load();
  }, [weekStart]);

  function aptTop(dt: string): number {
    const d = new Date(dt);
    return (d.getHours() - 8) * HOUR_H + (d.getMinutes() / 60) * HOUR_H;
  }

  function weekLabel(): string {
    const s = `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`;
    const e = `${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
    return `${s} – ${e}`;
  }

  async function updateStatus(id: number, status: string) {
    await appointmentsApi.update(id, { status });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              className="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-on-background transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-on-background font-semibold text-sm px-1 min-w-[160px] text-center">
              {weekLabel()}
            </span>
            <button
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-on-background transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
        <button
          onClick={() => setWeekStart(getMonday(new Date()))}
          className="text-xs font-semibold text-primary hover:text-primary/70 border border-primary/30 px-3 py-1 rounded-full transition-colors"
        >
          Bu Hafta
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-outline-variant/50 bg-surface-container-lowest">
        {[
          { label: "Bekliyor",  dot: "bg-amber-400" },
          { label: "Onaylandı", dot: "bg-green-500" },
          { label: "İptal",     dot: "bg-rose-400"  },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-secondary">
            <span className={cn("w-2 h-2 rounded-full", dot)} />
            {label}
          </div>
        ))}
        {loading && <span className="ml-auto text-xs text-secondary animate-pulse">Yükleniyor…</span>}
      </div>

      <div className="flex overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {/* Saat sütunu */}
        <div className="flex-shrink-0 w-14 border-r border-outline-variant/40 bg-surface-container-lowest">
          <div className="h-10 border-b border-outline-variant/40" />
          {HOURS.map((h) => (
            <div
              key={h}
              className="border-b border-outline-variant/20 text-right pr-2 text-xs text-secondary/60 flex items-start pt-1"
              style={{ height: HOUR_H }}
            >
              {`${h}:00`}
            </div>
          ))}
        </div>

        {/* Gün sütunları */}
        {weekDays.map((day, di) => {
          const isToday  = isSameDay(day, new Date());
          const dayAppts = appointments.filter((a) => isSameDay(new Date(a.datetime), day));

          return (
            <div key={di} className="flex-1 min-w-[110px] border-r border-outline-variant/30 last:border-r-0 relative">
              {/* Gün başlığı */}
              <div
                className={cn(
                  "h-10 border-b border-outline-variant/40 flex flex-col items-center justify-center gap-0.5",
                  isToday ? "bg-primary/5" : "bg-surface-container-lowest"
                )}
              >
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", isToday ? "text-primary" : "text-secondary")}>
                  {DAY_LABELS[di]}
                </span>
                <span
                  className={cn(
                    "text-base font-bold leading-none w-7 h-7 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-primary text-on-primary"
                      : "text-on-background"
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Saat satırları */}
              <div className="relative" style={{ height: HOURS.length * HOUR_H }}>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className={cn(
                      "border-b border-outline-variant/20",
                      isToday && "bg-primary/[0.02]"
                    )}
                    style={{ height: HOUR_H }}
                  />
                ))}

                {/* Randevu blokları */}
                {dayAppts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(selected?.id === a.id ? null : a)}
                    className={cn(
                      "absolute left-1 right-1 rounded-lg border text-left px-2 py-1 text-xs leading-tight overflow-hidden",
                      "hover:brightness-95 transition-all shadow-sm",
                      selected?.id === a.id && "ring-2 ring-primary/40",
                      STATUS_COLOR[a.status] ?? STATUS_COLOR.pending
                    )}
                    style={{ top: aptTop(a.datetime), height: HOUR_H / 2 - 3 }}
                  >
                    <div className="font-semibold truncate">{a.patient_name}</div>
                    <div className="opacity-60 truncate text-[10px]">
                      {doctorMap[a.doctor_id]?.name ?? ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detay paneli */}
      {selected && (
        <div className="border-t border-outline-variant bg-surface-container-low px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", STATUS_DOT[selected.status] ?? STATUS_DOT.pending)} />
              <div>
                <h4 className="text-on-background font-semibold">{selected.patient_name}</h4>
                <p className="text-secondary text-sm">{selected.patient_phone}</p>
                <p className="text-secondary text-sm mt-1">
                  <span className="font-medium text-on-surface">{doctorMap[selected.doctor_id]?.name}</span>
                  {" — "}
                  {new Date(selected.datetime).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {selected.note && (
                  <p className="text-secondary text-sm mt-1 italic">{selected.note}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {selected.status !== "confirmed" && (
                <button
                  onClick={() => updateStatus(selected.id, "confirmed")}
                  className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Onayla
                </button>
              )}
              {selected.status !== "cancelled" && (
                <button
                  onClick={() => updateStatus(selected.id, "cancelled")}
                  className="text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  İptal Et
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-secondary border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
