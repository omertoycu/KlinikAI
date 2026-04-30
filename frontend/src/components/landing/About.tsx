import { motion } from "framer-motion";
import { Heart, ShieldCheck, Users, Award, Clock, Star } from "lucide-react";

const stats = [
  { value: "10+", label: "Yıllık Deneyim" },
  { value: "5.000+", label: "Memnun Hasta" },
  { value: "15+", label: "Uzman Hekim" },
  { value: "7/24", label: "AI Destek" },
];

const values = [
  {
    icon: Heart,
    title: "Hasta Odaklı Yaklaşım",
    description:
      "Her hastamızı bireysel olarak değerlendirir, kişiselleştirilmiş sağlık hizmetleri sunarız. Sizin konforunuz ve iyiliğiniz her zaman önceliğimizdir.",
  },
  {
    icon: ShieldCheck,
    title: "Güven & Şeffaflık",
    description:
      "Tüm tedavi süreçlerinde hastalarımızı eksiksiz bilgilendiririz. Kişisel verileriniz KVKK kapsamında en yüksek güvenlik standartlarıyla korunur.",
  },
  {
    icon: Award,
    title: "Uzmanlık & Kalite",
    description:
      "Alanında uzman hekim kadromuz ve sürekli güncellenen teknolojimizle en güncel tıbbi yaklaşımları uygularız.",
  },
];

const team = [
  {
    name: "Dr. Ayşe Kaya",
    title: "Genel Müdür & Baş Hekim",
    specialty: "Dahiliye Uzmanı",
    initials: "AK",
  },
  {
    name: "Dr. Mehmet Özkan",
    title: "Klinik Direktörü",
    specialty: "Ortopedi Uzmanı",
    initials: "MÖ",
  },
  {
    name: "Uzm. Psk. Selin Arslan",
    title: "Psikoloji Birimi Başkanı",
    specialty: "Klinik Psikolog",
    initials: "SA",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

export default function About() {
  return (
    <section id="hakkimizda" className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full mb-4">
            <Users size={14} className="text-primary" />
            <span className="font-bold text-xs">Hakkımızda</span>
          </div>
          <h2 className="text-4xl font-extrabold text-on-background font-manrope mb-4">
            Sağlığınız İçin <span className="text-primary">Buradayız</span>
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            2014'ten bu yana hastalarımıza modern tıbbın olanaklarını sıcak bir ortamda sunuyoruz.
            Geleneksel klinik anlayışını yapay zeka teknolojisiyle harmanlayarak sağlık deneyimini yeniden tanımlıyoruz.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 text-center"
            >
              <div className="text-3xl font-extrabold text-primary font-manrope mb-1">{value}</div>
              <div className="text-sm text-secondary">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Story + values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20 items-center">
          <motion.div {...fadeUp(0.15)}>
            <h3 className="text-2xl font-bold text-on-background font-manrope mb-4">
              Hikayemiz
            </h3>
            <p className="text-secondary leading-relaxed mb-4">
              KlinikAI, sağlık hizmetlerinin daha erişilebilir ve verimli olması gerektiği inancıyla kuruldu.
              Hastalarımızın sağlık yolculuğunun her adımında yanlarında olmak için çalışıyoruz.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Yapay zeka destekli sistemimiz sayesinde hastalarımız artık gece yarısı bile sorularına
              yanıt bulabiliyor, kolayca randevu alabiliyor. Biz hekim kadromuza odaklanırken,
              AI asistanımız ön büro görevlerini üstleniyor.
            </p>
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
              <Star size={18} className="text-primary flex-shrink-0" />
              <p className="text-sm text-on-surface">
                Google'da <span className="font-bold text-primary">4.9/5</span> — 400'den fazla hasta değerlendirmesi
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="space-y-4">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-bold text-on-background text-sm mb-1">{title}</div>
                  <div className="text-secondary text-sm leading-relaxed">{description}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Team */}
        <motion.div {...fadeUp(0.25)}>
          <h3 className="text-2xl font-bold text-on-background font-manrope text-center mb-8">
            Hekim Kadromuz
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map(({ name, title, specialty, initials }) => (
              <div
                key={name}
                className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-bold mx-auto mb-4 font-manrope">
                  {initials}
                </div>
                <div className="font-bold text-on-background mb-0.5">{name}</div>
                <div className="text-primary text-sm font-medium mb-1">{specialty}</div>
                <div className="text-secondary text-xs">{title}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-16 bg-primary rounded-3xl p-10 text-center text-on-primary"
        >
          <Clock size={32} className="mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold font-manrope mb-2">Bugün Randevu Alın</h3>
          <p className="opacity-80 mb-6 max-w-md mx-auto">
            AI asistanımız 7/24 hizmetinizde. Hemen soru sorun, birkaç dakika içinde randevunuzu oluşturun.
          </p>
          <a
            href="/asistan"
            className="inline-flex items-center gap-2 bg-on-primary text-primary font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
          >
            AI Asistana Başla
          </a>
        </motion.div>

      </div>
    </section>
  );
}
