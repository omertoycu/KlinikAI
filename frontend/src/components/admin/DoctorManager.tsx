import { useEffect, useState } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight, X, Check, Loader2, Stethoscope } from "lucide-react";
import { doctorsApi, type Doctor } from "@/lib/api";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "monday",    label: "Pazartesi" },
  { key: "tuesday",   label: "Salı"      },
  { key: "wednesday", label: "Çarşamba"  },
  { key: "thursday",  label: "Perşembe"  },
  { key: "friday",    label: "Cuma"      },
  { key: "saturday",  label: "Cumartesi" },
  { key: "sunday",    label: "Pazar"     },
];

type WorkingHours = Record<string, { start: string; end: string }>;

interface FormState {
  name: string;
  specialty: string;
  working_hours: WorkingHours;
}

const EMPTY_FORM: FormState = {
  name: "",
  specialty: "",
  working_hours: {
    monday:    { start: "09:00", end: "18:00" },
    tuesday:   { start: "09:00", end: "18:00" },
    wednesday: { start: "09:00", end: "18:00" },
    thursday:  { start: "09:00", end: "18:00" },
    friday:    { start: "09:00", end: "18:00" },
  },
};

interface Props { token: string }

export default function DoctorManager({ token }: Props) {
  const [doctors,  setDoctors]  = useState<Doctor[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<FormState>(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await doctorsApi.list({ active_only: false });
      setDoctors(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(d: Doctor) {
    setEditId(d.id);
    setForm({ name: d.name, specialty: d.specialty, working_hours: { ...d.working_hours } });
    setShowForm(true);
  }

  function startCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.specialty.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await doctorsApi.update(editId, form, token);
      } else {
        await doctorsApi.create({ ...form, is_active: true }, token);
      }
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d: Doctor) {
    await doctorsApi.update(d.id, { is_active: !d.is_active }, token);
    load();
  }

  function toggleDay(dayKey: string) {
    setForm((f) => {
      const wh = { ...f.working_hours };
      if (wh[dayKey]) {
        const { [dayKey]: _, ...rest } = wh;
        return { ...f, working_hours: rest };
      }
      return { ...f, working_hours: { ...wh, [dayKey]: { start: "09:00", end: "18:00" } } };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-secondary text-sm">{doctors.length} doktor kayıtlı</p>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} />
          Doktor Ekle
        </button>
      </div>

      {/* Doktor listesi */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-outline-variant rounded-2xl">
            <Stethoscope size={32} className="text-secondary/40 mx-auto mb-3" />
            <p className="text-secondary">Henüz doktor eklenmemiş.</p>
          </div>
        ) : (
          doctors.map((d) => (
            <div
              key={d.id}
              className={cn(
                "flex items-center justify-between px-5 py-4 rounded-2xl border transition-colors",
                d.is_active
                  ? "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                  : "border-outline-variant/40 bg-surface-container opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                  {d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-on-background font-semibold">{d.name}</p>
                  <p className="text-primary text-sm font-medium">{d.specialty}</p>
                  <p className="text-secondary text-xs mt-0.5">
                    {Object.keys(d.working_hours)
                      .map((k) => DAYS.find((day) => day.key === k)?.label.slice(0, 3) ?? k)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(d)}
                  className="p-2 rounded-xl hover:bg-surface-container text-secondary hover:text-on-background transition-colors"
                  title="Düzenle"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => toggleActive(d)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    d.is_active
                      ? "text-green-600 hover:bg-green-50"
                      : "text-secondary hover:bg-surface-container hover:text-on-background"
                  )}
                  title={d.is_active ? "Deaktif Et" : "Aktif Et"}
                >
                  {d.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
              <div>
                <h3 className="text-on-background font-semibold">
                  {editId !== null ? "Doktoru Düzenle" : "Yeni Doktor Ekle"}
                </h3>
                <p className="text-secondary text-xs mt-0.5">Tüm alanları doldurun</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl text-secondary hover:text-on-background hover:bg-surface-container transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-on-surface-variant text-sm font-medium mb-1.5">Ad Soyad</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Dr. Adı Soyadı"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant text-sm font-medium mb-1.5">Uzmanlık</label>
                <input
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  placeholder="Diş Hekimi, Diyetisyen, vb."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant text-sm font-medium mb-2">
                  Çalışma Günleri & Saatleri
                </label>
                <div className="space-y-2">
                  {DAYS.map(({ key, label }) => {
                    const active = !!form.working_hours[key];
                    const hours  = form.working_hours[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDay(key)}
                          className={cn(
                            "w-24 text-xs py-1.5 rounded-lg border font-medium transition-colors",
                            active
                              ? "border-primary/40 bg-primary-container text-on-primary-container"
                              : "border-outline-variant bg-surface-container text-secondary hover:text-on-surface"
                          )}
                        >
                          {label.slice(0, 3)}
                        </button>
                        {active && (
                          <>
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  working_hours: {
                                    ...f.working_hours,
                                    [key]: { ...hours, start: e.target.value },
                                  },
                                }))
                              }
                              className="bg-surface-container-low border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                            <span className="text-secondary text-xs">–</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  working_hours: {
                                    ...f.working_hours,
                                    [key]: { ...hours, end: e.target.value },
                                  },
                                }))
                              }
                              className="bg-surface-container-low border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-secondary border border-outline-variant hover:bg-surface-container rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
