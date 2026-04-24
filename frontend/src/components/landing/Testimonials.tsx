import { motion, type Easing } from "framer-motion";
import { Star, Quote } from "lucide-react";
import InfiniteMarquee from "@/components/ui/InfiniteMarquee";

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  avatarBg: string;
  avatarColor: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: "Ayşe Kaya",
    role: "Diş Tedavisi Hastası",
    text: "AI asistan sayesinde saat 23:00'te randevumu kolayca aldım. Ertesi sabah kliniği aramasam da randevum onaylanmıştı!",
    rating: 5,
    avatar: "AK",
    avatarBg: "bg-secondary-container",
    avatarColor: "text-on-secondary-container",
  },
  {
    name: "Mehmet Demir",
    role: "Diyetisyen Danışanı",
    text: "Fiyatları ve programları chat üzerinden öğrendim. Çok pratik ve hızlıydı, sanki gerçek bir asistanla konuşuyordum.",
    rating: 5,
    avatar: "MD",
    avatarBg: "bg-primary-fixed",
    avatarColor: "text-on-primary-fixed-variant",
  },
  {
    name: "Zeynep Arslan",
    role: "Estetik Uygulama Hastası",
    text: "İşlem öncesi aklımdaki tüm soruları sordurdum. Doktor bilgisi kadar yerinde cevaplar aldım, harika bir deneyimdi.",
    rating: 5,
    avatar: "ZA",
    avatarBg: "bg-tertiary-fixed",
    avatarColor: "text-on-tertiary-fixed-variant",
  },
  {
    name: "Can Yıldız",
    role: "Genel Check-up Hastası",
    text: "Gece randevu aldım, sabah onay SMS'i geldi. Bunu manuel yapan bir sekreterden çok daha hızlı!",
    rating: 5,
    avatar: "CY",
    avatarBg: "bg-surface-container",
    avatarColor: "text-on-surface-variant",
  },
  {
    name: "Fatma Şahin",
    role: "Diş Estetiği Hastası",
    text: "Hangi dolgu daha doğal görünür diye sordum, AI gerçekten faydalı karşılaştırmalar yaptı. Süper bir sistem.",
    rating: 5,
    avatar: "FŞ",
    avatarBg: "bg-secondary-container",
    avatarColor: "text-on-secondary-container",
  },
  {
    name: "Ali Vural",
    role: "Diyet Programı Danışanı",
    text: "Program detaylarını chat'ten öğrendim ve hemen randevu aldım. Telefon kuyruğu yok, bekleme yok. Harika!",
    rating: 5,
    avatar: "AV",
    avatarBg: "bg-primary-fixed",
    avatarColor: "text-on-primary-fixed-variant",
  },
];

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="mx-3 w-[320px] bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-ambient hover:-translate-y-0.5 transition-transform">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: item.rating }).map((_, idx) => (
            <Star key={idx} size={13} className="text-primary fill-primary" />
          ))}
        </div>
        <Quote size={18} className="text-primary-fixed-dim" />
      </div>
      <p className="text-on-surface-variant text-sm leading-relaxed mb-5 italic">
        "{item.text}"
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
        <div
          className={`w-10 h-10 ${item.avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className={`text-xs font-bold ${item.avatarColor}`}>{item.avatar}</span>
        </div>
        <div>
          <div className="text-on-background font-bold text-sm">{item.name}</div>
          <div className="text-secondary text-xs">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

const EASE: Easing = "easeOut";

export default function Testimonials() {
  return (
    <section id="yorumlar" className="py-[120px] bg-surface-container-low overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 mb-14">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col gap-3 max-w-xl"
          >
            <h2 className="text-4xl font-extrabold text-on-background font-manrope">
              Hastalarımız Ne Diyor?
            </h2>
            <p className="text-secondary text-lg">
              Gerçek hastalar, gerçek deneyimler. AI destekli klinik sistemimizin
              farkını görün.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex gap-8 flex-shrink-0"
          >
            <div className="flex flex-col">
              <span className="text-5xl font-extrabold text-primary font-manrope">10K+</span>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider mt-1">
                Mutlu Hasta
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl font-extrabold text-primary font-manrope">15+</span>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider mt-1">
                Uzman Hekim
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <InfiniteMarquee<TestimonialItem>
        items={testimonials}
        speed={40}
        renderItem={(item) => <TestimonialCard item={item} />}
      />
    </section>
  );
}
