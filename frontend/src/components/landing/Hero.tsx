import { motion, type Easing } from "framer-motion";
import { Sparkles, Calendar, MessageCircle, CheckCircle, Clock, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import heroImg from "@/assets/doctor.png";

interface HeroProps {
  onOpenChat: () => void;
}

const EASE: Easing = "easeOut";
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: EASE },
});

const trustItems = [
  { icon: CheckCircle, label: "KVKK Uyumlu" },
  { icon: Clock, label: "Ortalama 3dk Yanıt" },
  { icon: Shield, label: "Güvenli & Şifreli" },
];

export default function Hero({ onOpenChat }: HeroProps) {
  return (
    <section className="relative pt-[120px] pb-12 px-6 max-w-[1280px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

        {/* Left: Text */}
        <div className="flex flex-col gap-6 z-10 order-2 lg:order-1">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full w-fit"
          >
            <Sparkles size={15} className="text-primary" />
            <span className="font-bold text-xs">Yapay Zeka Destekli Klinik Yönetimi</span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl lg:text-6xl font-extrabold text-on-background leading-[1.15] font-manrope"
          >
            Modern Klinik,<br />
            <span className="text-primary">AI Titizliğiyle</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg text-secondary leading-relaxed max-w-lg">
            Geleneksel klinik deneyiminin sıcaklığını yapay zeka teknolojisiyle
            harmanlıyoruz. Hastalarınız 7/24 soru sorabilir, anında randevu alabilir.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" onClick={onOpenChat} className="gap-2">
              <MessageCircle size={18} />
              Ücretsiz Dene
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById("hizmetler")?.scrollIntoView({ behavior: "smooth" })}
              className="gap-2"
            >
              <Calendar size={18} />
              Hizmetleri İncele
            </Button>
          </motion.div>

          <motion.div
            {...fadeUp(0.45)}
            className="flex flex-wrap items-center gap-5 pt-6 border-t border-outline-variant/40"
          >
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-secondary text-sm">
                <Icon size={15} className="text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full h-[560px] rounded-3xl overflow-hidden shadow-ambient z-0 order-1 lg:order-2"
        >
          <img
            src={heroImg}
            alt="Klinik ortamı"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-surface-variant rounded-full mix-blend-multiply filter blur-2xl opacity-70" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-2xl opacity-70" />
        </motion.div>
      </div>
    </section>
  );
}
