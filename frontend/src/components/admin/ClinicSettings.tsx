import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2, Info } from "lucide-react";
import { settingsApi } from "@/lib/api";

const FIELDS: { key: string; label: string; type?: string; placeholder?: string; hint?: string }[] = [
  { key: "clinic_name",    label: "Klinik Adı",                    placeholder: "Örn: Dent Klinik"                       },
  { key: "clinic_phone",   label: "Telefon",                        placeholder: "+90 212 000 00 00"                      },
  { key: "clinic_email",   label: "Klinik Email",                   placeholder: "info@klinikiniz.com",  type: "email"    },
  { key: "clinic_address", label: "Adres",                          placeholder: "Mahalle, Cadde No, Şehir"               },
  { key: "primary_color",  label: "Tema Rengi",                     type: "color"                                         },
  { key: "welcome_message",label: "AI Karşılama Mesajı",            placeholder: "Merhaba! Size nasıl yardımcı olabilirim?" },
  { key: "logo_url",       label: "Logo URL",                       placeholder: "https://..."                            },
  { key: "app_url",        label: "Site URL (SMS iptal linki için)", placeholder: "https://klinikisiniz.com"               },
];

interface Props { token: string }

export default function ClinicSettings({ token }: Props) {
  const [values,  setValues]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    settingsApi.get(token).then((res) => {
      setValues(res.data);
      setLoading(false);
    });
  }, [token]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await settingsApi.update(values, token);
      setValues(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-secondary text-sm mb-8">
        Bu ayarlar klinik arayüzünü, AI asistanını ve gönderilen bildirimleri etkiler.
      </p>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="divide-y divide-outline-variant/50">
          {FIELDS.map(({ key, label, type = "text", placeholder }) => (
            <div key={key} className="px-6 py-5">
              <label className="block text-on-surface-variant text-sm font-medium mb-2">{label}</label>
              {type === "color" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={values[key] ?? "#0c3474"}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="h-10 w-14 rounded-xl cursor-pointer bg-transparent border border-outline-variant p-0.5"
                  />
                  <span className="text-secondary text-sm font-mono bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50">
                    {values[key] ?? "#0c3474"}
                  </span>
                </div>
              ) : (
                <input
                  type={type}
                  value={values[key] ?? ""}
                  placeholder={placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle2 size={15} />
            Kaydedildi
          </div>
        )}
      </div>

      {/* SMTP / SMS bilgi kartı */}
      <div className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-on-background font-semibold text-sm mb-2">SMS & Email Yapılandırması</h3>
            <p className="text-secondary text-xs leading-relaxed">
              SMS bildirimleri için <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">.env</code> dosyasına{" "}
              <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">NETGSM_USERCODE</code> ve{" "}
              <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">NETGSM_PASSWORD</code> değerlerini ekleyin.
              <br className="my-1" />
              Email için{" "}
              <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">SMTP_HOST</code>,{" "}
              <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">SMTP_USER</code>,{" "}
              <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">SMTP_PASSWORD</code> gereklidir.
              Gmail kullanıyorsanız{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                App Password
              </a>{" "}
              oluşturun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
