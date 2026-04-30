import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Calendar, MessageCircle, ArrowLeft, Stethoscope, FileQuestion, Clock } from "lucide-react";
import ChatMessages, { type Message } from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import AppointmentInlineForm from "@/components/chat/AppointmentInlineForm";
import { chatApi } from "@/lib/api";
import { generateSessionId } from "@/lib/utils";

const SESSION_ID = generateSessionId();

const QUICK_PROMPTS = [
  { icon: Clock, text: "Çalışma saatleriniz neler?" },
  { icon: Calendar, text: "Nasıl randevu alabilirim?" },
  { icon: Stethoscope, text: "Hangi hizmetleri sunuyorsunuz?" },
  { icon: FileQuestion, text: "Fiyat bilgisi alabilir miyim?" },
];

export default function Asistan() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Merhaba! Ben KlinikAI asistanınızım. Hizmetlerimiz, fiyatlarımız veya randevu hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = { id: `user_${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.send(SESSION_ID, text);
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: res.data.reply,
        intent: res.data.intent,
      };
      setMessages((prev) => [...prev, botMsg]);
      if (res.data.intent?.intent === "book_appointment") setShowForm(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasOnlyWelcome = messages.length === 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-outline-variant bg-surface-container-lowest px-6 h-16 flex items-center justify-between sticky top-0 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Ana Sayfa
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <Bot size={15} />
          </div>
          <div>
            <div className="text-on-background font-bold text-sm font-manrope">KlinikAI Asistan</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-secondary">Çevrimiçi</span>
            </div>
          </div>
        </div>

        <div className="text-primary font-bold text-lg font-manrope hidden sm:block">
          Klinik<span className="opacity-60">AI</span>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Left panel - Info */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <span className="font-bold text-on-background text-sm">AI Asistan Hakkında</span>
            </div>
            <p className="text-secondary text-sm leading-relaxed">
              7/24 hizmetinizdeyim. Klinik hizmetleri, fiyatlar, doktorlar ve randevu işlemleri hakkında anlık yanıt verebilirim.
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Anında yanıt",
                "Türkçe destek",
                "Randevu entegrasyonu",
                "Klinik bilgi tabanı",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-6"
          >
            <div className="font-bold text-on-background text-sm mb-3">Hızlı Başlangıç</div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSend(text)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-secondary hover:text-primary hover:bg-surface-container border border-transparent hover:border-primary/20 transition-all text-left"
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {text}
                </button>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest overflow-hidden"
          style={{ maxHeight: "calc(100vh - 7rem)" }}
        >
          {/* Empty state */}
          <AnimatePresence>
            {hasOnlyWelcome && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 pt-6 pb-2"
              >
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-start gap-3">
                  <MessageCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-on-surface">
                    Aşağıdan hızlı soru seçebilir ya da dilediğinizi yazabilirsiniz.
                  </p>
                </div>
                {/* Mobile quick prompts */}
                <div className="grid grid-cols-2 gap-2 mt-4 lg:hidden">
                  {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
                    <button
                      key={text}
                      onClick={() => handleSend(text)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-secondary hover:text-primary bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 transition-all text-left"
                    >
                      <Icon size={13} className="flex-shrink-0" />
                      {text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <ChatMessages messages={messages} loading={loading} />

          {/* Appointment form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <AppointmentInlineForm
                  onClose={() => setShowForm(false)}
                  onSuccess={() => {
                    setShowForm(false);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `success_${Date.now()}`,
                        role: "assistant",
                        content:
                          "Randevunuz başarıyla oluşturuldu! Kliniğimiz sizi arayarak onaylayacak.",
                      },
                    ]);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </motion.div>
      </div>
    </div>
  );
}
