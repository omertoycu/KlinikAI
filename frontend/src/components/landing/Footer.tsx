import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Footer() {
  return (
    <footer id="iletisim" className="bg-inverse-surface text-inverse-on-surface">
      {/* CTA bandı */}
      <div className="bg-gradient-to-r from-primary-container to-primary">
        <div className="max-w-[1280px] mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold text-on-primary mb-1 font-manrope">
              Kliniğinizi dijital geleceğe taşıyın
            </h3>
            <p className="text-on-primary-container text-sm">
              Ücretsiz deneyin — kurulum gerektirmez, anında aktif.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="bg-surface-container-lowest! text-primary! hover:bg-surface-variant! shadow-lg shadow-primary/20 flex-shrink-0 gap-2"
          >
            <MessageCircle size={18} />
            Hemen Başlayın
          </Button>
        </div>
      </div>

      {/* Ana footer */}
      <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="text-xl font-bold font-manrope mb-4 text-inverse-on-surface">
            Klinik<span className="text-primary-fixed-dim">AI</span>
          </div>
          <p className="text-inverse-on-surface/60 text-sm leading-relaxed max-w-xs">
            Butik klinikler için modern, yapay zeka destekli dijital sağlık çözümleri.
            7/24 aktif asistan ile hasta deneyimini dönüştürün.
          </p>
        </div>

        <div>
          <h4 className="text-inverse-on-surface font-semibold mb-5">İletişim</h4>
          <div className="space-y-4">
            {[
              { Icon: Phone, text: "+90 212 000 00 00" },
              { Icon: Mail, text: "info@klinikAI.com" },
              { Icon: MapPin, text: "İstanbul, Türkiye" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-inverse-on-surface/60 text-sm">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-primary-fixed-dim" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-inverse-on-surface font-semibold mb-5">Çalışma Saatleri</h4>
          <div className="space-y-3 text-sm">
            {[
              { label: "Pazartesi – Cuma", value: "09:00 – 18:00", highlight: false },
              { label: "Cumartesi", value: "10:00 – 14:00", highlight: false },
              { label: "Pazar", value: "Kapalı", highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between text-inverse-on-surface/60">
                <span>{label}</span>
                <span className={highlight ? "text-error font-medium" : "text-inverse-on-surface font-medium"}>
                  {value}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
              <span className="text-primary-fixed-dim text-xs font-semibold">AI Asistan 7/24 Aktif</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-inverse-on-surface/40 text-xs">
          <span>© {new Date().getFullYear()} KlinikAI. Tüm hakları saklıdır.</span>
          <div className="flex gap-6">
            {["Gizlilik Politikası", "Kullanım Koşulları", "KVKK"].map((item) => (
              <a key={item} href="#" className="hover:text-inverse-on-surface/70 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
