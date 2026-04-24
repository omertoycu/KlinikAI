import { motion, type Easing } from "framer-motion";
import { Bot, TrendingUp, Zap, Brain, ShieldCheck, Clock } from "lucide-react";

const EASE: Easing = "easeOut";
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: EASE },
});

const bars = [
  { label: "Randevu Kolaylığı", pct: 99 },
  { label: "AI Yanıt Kalitesi", pct: 97 },
  { label: "Genel Deneyim", pct: 98 },
];

export default function BentoFeatures() {
  return (
    <section id="neden-biz" className="py-[120px] px-6 bg-surface-container-low">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
        <motion.div {...fadeUp(0)} className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="text-4xl font-extrabold text-on-background font-manrope">
            Kliniğinizi Geleceğe Taşıyın
          </h2>
          <p className="text-secondary text-lg">
            Yapay zeka destekli araçlarımız ile hasta deneyimini yeniden tanımlayın.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Geniş kart — 7/24 AI */}
          <motion.div
            {...fadeUp(0.1)}
            className="md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform flex flex-col gap-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-5">
                  <Bot size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-on-background font-manrope mb-3">
                  7/24 Aktif AI Asistan
                </h3>
                <p className="text-secondary leading-relaxed max-w-md">
                  Gece yarısı soru soran bir hasta mı var? Sorun değil. AI asistanınız
                  uyumaz — fiyat listesi, randevu saatleri ve hizmet bilgisi her an hazır.
                </p>
              </div>
              <div className="hidden lg:flex flex-col gap-2 flex-shrink-0 mt-2">
                <div className="bg-primary text-on-primary text-xs px-4 py-2 rounded-2xl rounded-bl-sm max-w-[160px]">
                  Randevu almak istiyorum 🦷
                </div>
                <div className="bg-surface-container text-on-surface text-xs px-4 py-2 rounded-2xl rounded-br-sm max-w-[200px] self-end">
                  Tabii! Hangi gün uygun? Yarın sabah 10:00 da müsaitiz.
                </div>
                <div className="bg-primary text-on-primary text-xs px-4 py-2 rounded-2xl rounded-bl-sm max-w-[140px]">
                  Mükemmel, rezerve et!
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dar uzun kart — %98 Memnuniyet */}
          <motion.div
            {...fadeUp(0.2)}
            className="md:row-span-2 bg-gradient-to-b from-primary-container to-primary rounded-3xl p-8 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform flex flex-col justify-between text-on-primary"
          >
            <div>
              <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mb-5 backdrop-blur-sm">
                <TrendingUp size={26} />
              </div>
              <h3 className="text-2xl font-extrabold font-manrope mb-3">
                %98 Hasta Memnuniyeti
              </h3>
              <p className="text-on-primary-container text-sm leading-relaxed">
                AI destekli randevu sisteminin hasta memnuniyetini dramatik biçimde
                artırdığını veriler gösteriyor.
              </p>
            </div>
            <div className="mt-8">
              <div className="text-6xl font-black mb-1">%98</div>
              <div className="text-on-primary-container text-sm mb-6">Ortalama memnuniyet skoru</div>
              <div className="space-y-3">
                {bars.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-on-primary-container mb-1">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/80 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Küçük kart — 3 Dakika */}
          <motion.div
            {...fadeUp(0.3)}
            className="bg-surface-container-lowest rounded-3xl p-7 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform"
          >
            <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-4">
              <Zap size={22} />
            </div>
            <h3 className="text-xl font-extrabold text-on-background font-manrope mb-2">
              3 Dakikada Randevu
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              Hastanız sohbet penceresinden dakikalar içinde gerçek zamanlı takvime
              randevu kaydedebilir. Sıfır telefon, sıfır bekleme.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Clock size={13} className="text-primary" />
              <span className="text-xs text-primary font-bold">Ortalama işlem: ~3 dakika</span>
            </div>
          </motion.div>

          {/* Küçük kart — Kendi Verisi */}
          <motion.div
            {...fadeUp(0.4)}
            className="bg-surface-container-lowest rounded-3xl p-7 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform"
          >
            <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-full flex items-center justify-center mb-4">
              <Brain size={22} />
            </div>
            <h3 className="text-xl font-extrabold text-on-background font-manrope mb-2">
              Kendi Verinizle Çalışır
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              PDF fiyat listenizi yükleyin. AI, klinik özgü bilgiyle anında donanır.
              Genel cevaplar değil, sizin cevaplarınız.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <ShieldCheck size={13} className="text-primary" />
              <span className="text-xs text-primary font-bold">RAG destekli klinik zekası</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
