import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot } from "lucide-react";
import ChatMessages, { type Message } from "./ChatMessages";
import ChatInput from "./ChatInput";
import AppointmentInlineForm from "./AppointmentInlineForm";
import { chatApi } from "@/lib/api";
import { generateSessionId } from "@/lib/utils";

const SESSION_ID = generateSessionId();

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function ChatWidget({ isOpen, onClose, onOpen }: ChatWidgetProps) {
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

  return (
    <>
      {/* Floating button + konuşma balonu */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          >
            {/* Konuşma balonu */}
            <div className="relative bg-surface-container-lowest rounded-2xl px-4 py-3 shadow-ambient border border-primary-fixed-dim/20 max-w-[200px] mb-1">
              <p className="text-xs font-bold text-on-background leading-snug">
                Hizmetlerimiz hakkında sorunuz mu var?
              </p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-surface-container-lowest border-r border-b border-primary-fixed-dim/20 rotate-45" />
            </div>
            {/* Buton */}
            <button
              onClick={onOpen}
              className="w-16 h-16 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <MessageCircle size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat paneli */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col rounded-3xl border border-primary-fixed-dim/20 bg-surface-container-lowest shadow-ambient overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/30 bg-surface-container-low">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="flex-1">
                <div className="text-on-background font-bold text-sm">KlinikAI Asistan</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-secondary">Çevrimiçi</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-secondary hover:text-on-background transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mesajlar */}
            <ChatMessages messages={messages} loading={loading} />

            {/* Randevu formu (intent tetiklenince) */}
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
        )}
      </AnimatePresence>
    </>
  );
}
