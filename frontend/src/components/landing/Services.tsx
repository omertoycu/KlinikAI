import { motion, type Easing } from "framer-motion";
import { Smile, Salad, Sparkles, Bot, ArrowRight } from "lucide-react";

interface ServicesProps {
  onOpenChat?: () => void;
}

const services = [
  {
    icon: Smile,
    title: "Diş Tedavileri",
    description:
      "İmplant, kanal tedavisi, estetik diş hekimliği ve genel diş sağlığı hizmetleri. AI destekli 3D planlama ile kusursuz yerleşim.",
    wide: true,
    iconBg: "bg-primary-container",
    iconColor: "text-on-primary-container",
    link: "Detaylı Bilgi",
  },
  {
    icon: Salad,
    title: "Diyetisyen Desteği",
    description:
      "Kişiselleştirilmiş beslenme programları ve sağlıklı yaşam danışmanlığı ile hedeflerinize ulaşın.",
    wide: false,
    iconBg: "bg-surface-variant",
    iconColor: "text-on-surface-variant",
    link: "Programları İncele",
  },
  {
    icon: Sparkles,
    title: "Estetik Uygulamalar",
    description:
      "Cilt bakımı, lazer epilasyon, botoks ve dolgu uygulamaları ile kendinizi en iyi hissettirin.",
    wide: false,
    iconBg: "bg-tertiary-container",
    iconColor: "text-on-tertiary-container",
    link: "Seçenekleri Gör",
  },
];

const EASE: Easing = "easeOut";

export default function Services({ onOpenChat }: ServicesProps) {
  return (
    <section id="hizmetler" className="py-[120px] px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center max-w-2xl mx-auto flex flex-col gap-3"
        >
          <h2 className="text-4xl font-extrabold text-on-background font-manrope">
            Kapsamlı Tedavi Çözümleri
          </h2>
          <p className="text-secondary text-lg">
            İhtiyacınız olan her türlü klinik hizmeti, uzman hekimler ve ileri teknoloji
            ekipmanlarıyla tek çatı altında.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
              className={`bg-surface-container-lowest rounded-3xl p-8 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform flex flex-col gap-6 ${
                service.wide ? "md:col-span-2" : ""
              }`}
            >
              <div
                className={`w-16 h-16 ${service.iconBg} ${service.iconColor} rounded-full flex items-center justify-center`}
              >
                <service.icon size={28} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-extrabold text-on-background font-manrope">
                  {service.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed">{service.description}</p>
              </div>
              <div className="mt-auto">
                <button
                  onClick={() => document.getElementById("hizmetler")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  {service.link} <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}

          {/* AI Analiz Kartı */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
            className="md:col-span-2 bg-gradient-to-br from-primary-container to-primary rounded-3xl p-8 shadow-ambient border border-primary-fixed-dim/10 hover:-translate-y-1 transition-transform flex flex-col gap-6 text-on-primary"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot size={28} />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-xl font-extrabold font-manrope">KlinikAI Ön Analiz</h3>
              <p className="text-on-primary-container text-sm leading-relaxed">
                Yapay zeka asistanımıza sorularınızı sorun, potansiyel sorunlarınız hakkında
                ön bilgi alın. Kliniğe gelmeden durumunuzu değerlendirin.
              </p>
            </div>
            <div className="mt-auto">
              <button
                onClick={onOpenChat}
                className="bg-surface-container-lowest text-primary rounded-full px-6 py-3 font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                AI ile Analiz Et
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
