import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";

type Tab = "login" | "register";

export default function HastaGirisi() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // login fields
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(loginPhone, loginPassword);
      auth.setSession(res.data.access_token, res.data.patient);
      navigate("/hesabim");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (regPassword !== regPassword2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        name: regName,
        phone: regPhone,
        email: regEmail || undefined,
        password: regPassword,
      });
      auth.setSession(res.data.access_token, res.data.patient);
      navigate("/hesabim");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Kayıt oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-ambient"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-2xl font-extrabold text-primary font-manrope mb-1">
              Klinik<span className="opacity-60">AI</span>
            </div>
            <p className="text-secondary text-sm">Hasta Portalı</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface-variant rounded-2xl p-1 mb-6 gap-1">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === t
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {t === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="tel"
                  placeholder="Telefon numarası"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="mt-2 gap-2" disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Giriş Yap
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="tel"
                  placeholder="Telefon numarası"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="email"
                  placeholder="E-posta (opsiyonel)"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="password"
                  placeholder="Şifre (min. 6 karakter)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="password"
                  placeholder="Şifre tekrar"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                  required
                  className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="mt-2 gap-2" disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Kayıt Ol
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
