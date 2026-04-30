import { useEffect, useState } from "react";
import { TrendingUp, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Summary {
  total_this_month: number;
  total_all_time: number;
  confirmed_this_month: number;
  cancelled_this_month: number;
  no_show_rate: number;
  by_status: Record<string, number>;
  by_hour: { hour: number; count: number }[];
  monthly_trend: { label: string; count: number }[];
}

interface Props { token: string }

export default function Analytics({ token }: Props) {
  const [data,    setData]    = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.summary(token)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary">Veri alınamadı.</p>
      </div>
    );
  }

  const maxMonthly = Math.max(...data.monthly_trend.map((m) => m.count), 1);
  const maxHour    = Math.max(...data.by_hour.map((h) => h.count), 1);

  const statCards = [
    {
      label: "Bu Ay Toplam",
      value: data.total_this_month,
      icon: Calendar,
      iconBg: "bg-primary-container",
      iconColor: "text-on-primary-container",
      valueCls: "text-on-background",
    },
    {
      label: "Onaylanan",
      value: data.confirmed_this_month,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      valueCls: "text-green-700",
    },
    {
      label: "İptal / No-Show",
      value: data.cancelled_this_month,
      icon: XCircle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      valueCls: "text-rose-600",
    },
    {
      label: "İptal Oranı",
      value: `${data.no_show_rate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      valueCls: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, valueCls }) => (
          <div
            key={label}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", iconBg)}>
              <Icon className={iconColor} size={18} />
            </div>
            <p className={cn("text-3xl font-bold font-manrope", valueCls)}>{value}</p>
            <p className="text-secondary text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aylık trend */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h3 className="text-on-background font-semibold mb-1">Son 7 Ay</h3>
          <p className="text-secondary text-xs mb-6">Aylık randevu trendi</p>
          <div className="flex items-end gap-2 h-40">
            {data.monthly_trend.map((m) => {
              const pct = maxMonthly > 0 ? Math.round((m.count / maxMonthly) * 100) : 0;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div
                      className="rounded-t-lg bg-primary transition-all duration-700"
                      style={{ height: `${pct}%`, minHeight: m.count > 0 ? 4 : 0 }}
                    />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-on-background text-xs font-semibold">{m.count}</p>
                    <p className="text-secondary text-[10px] leading-tight">{m.label.split(" ")[0]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak saatler */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h3 className="text-on-background font-semibold mb-1">En Yoğun Saatler</h3>
          <p className="text-secondary text-xs mb-6">Bu ayki randevu dağılımı</p>
          {data.by_hour.length === 0 ? (
            <p className="text-secondary text-sm">Bu ay için veri yok.</p>
          ) : (
            <div className="space-y-3">
              {data.by_hour.slice(0, 6).map(({ hour, count }) => {
                const pct = Math.round((count / maxHour) * 100);
                return (
                  <div key={hour} className="flex items-center gap-3">
                    <span className="text-secondary text-xs w-12 text-right font-mono tabular-nums">
                      {`${hour}:00`}
                    </span>
                    <div className="flex-1 bg-surface-container rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-on-surface-variant text-xs w-6 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Durum dağılımı */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="text-on-background font-semibold mb-1">Bu Ay Durum Dağılımı</h3>
        <p className="text-secondary text-xs mb-6">Toplam: {data.total_this_month} randevu</p>
        {data.total_this_month === 0 ? (
          <p className="text-secondary text-sm">Bu ay henüz randevu yok.</p>
        ) : (
          <div className="space-y-4">
            {[
              { key: "pending",   label: "Bekliyor",  bar: "bg-amber-400", text: "text-amber-700" },
              { key: "confirmed", label: "Onaylandı", bar: "bg-green-500", text: "text-green-700" },
              { key: "cancelled", label: "İptal",     bar: "bg-rose-400",  text: "text-rose-600"  },
            ].map(({ key, label, bar, text }) => {
              const count = data.by_status[key] ?? 0;
              const pct   = data.total_this_month > 0
                ? Math.round((count / data.total_this_month) * 100)
                : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-sm font-medium">{label}</span>
                    <span className={cn("text-sm font-semibold", text)}>
                      {count} <span className="text-secondary font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full transition-all duration-700", bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
