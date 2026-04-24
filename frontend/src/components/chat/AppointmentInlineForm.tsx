import { useEffect, useState } from "react";
import { Calendar, Clock, User, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { appointmentsApi, doctorsApi, type Doctor } from "@/lib/api";
import { auth } from "@/lib/auth";

interface AppointmentInlineFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentInlineForm({ onClose, onSuccess }: AppointmentInlineFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const patient = auth.getPatient();
  const [form, setForm] = useState({
    doctor_id: "",
    date: "",
    slot: "",
    patient_name: patient?.name ?? "",
    patient_phone: patient?.phone ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    doctorsApi.list().then((r) => setDoctors(r.data));
  }, []);

  useEffect(() => {
    if (form.doctor_id && form.date) {
      setSlots([]);
      appointmentsApi
        .slots(Number(form.doctor_id), form.date)
        .then((r) => setSlots(r.data.slots))
        .catch(() => setError("Müsait saatler yüklenemedi."));
    }
  }, [form.doctor_id, form.date]);

  async function handleSubmit() {
    if (!form.doctor_id || !form.date || !form.slot || !form.patient_name || !form.patient_phone) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const datetime = `${form.date}T${form.slot}:00`;
      await appointmentsApi.create({
        doctor_id: Number(form.doctor_id),
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        datetime,
      });
      onSuccess();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "Randevu oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">Randevu Oluştur</span>
        <button onClick={onClose} className="text-secondary hover:text-on-surface">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <select
            value={form.doctor_id}
            onChange={(e) => setForm({ ...form, doctor_id: e.target.value, slot: "" })}
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="">Doktor seçin</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setForm({ ...form, date: e.target.value, slot: "" })}
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-lg pl-8 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="relative">
          <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <select
            value={form.slot}
            onChange={(e) => setForm({ ...form, slot: e.target.value })}
            disabled={!slots.length}
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-lg pl-8 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">Saat seçin</option>
            {slots.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Adınız Soyadınız"
            value={form.patient_name}
            onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-lg pl-8 pr-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="relative">
          <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="tel"
            placeholder="Telefon"
            value={form.patient_phone}
            onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
            className="w-full bg-surface-variant border border-outline-variant/40 rounded-lg pl-8 pr-3 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && <p className="text-error text-xs">{error}</p>}

      <Button
        size="sm"
        className="w-full"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Randevuyu Onayla"}
      </Button>
    </div>
  );
}
