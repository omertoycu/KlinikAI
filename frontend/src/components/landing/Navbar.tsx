import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/auth";

interface NavbarProps {
  onOpenChat: () => void;
}

const links = [
  { label: "Hizmetler",  href: "#hizmetler",   external: false },
  { label: "AI Asistan", href: "/asistan",      external: true  },
  { label: "Hakkımızda", href: "#hakkimizda",   external: false },
  { label: "Yorumlar",   href: "#yorumlar",      external: false },
];

export default function Navbar({ onOpenChat }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-container-lowest/90 backdrop-blur-md shadow-sm border-b border-primary-fixed-dim/20"
          : "bg-surface-container-lowest/60 backdrop-blur-md"
      }`}
    >
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-6 h-20">
        <div className="text-2xl font-bold tracking-tight text-primary font-manrope">
          Klinik<span className="opacity-60">AI</span>
        </div>

        <div className="hidden md:flex space-x-8 text-sm font-bold">
          {links.map((l, i) =>
            l.external ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-secondary hover:text-primary transition-colors pb-1"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className={`transition-colors pb-1 ${
                  i === 0
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-4">
          {auth.isLoggedIn() ? (
            <Link
              to="/hesabim"
              className="hidden md:block text-primary font-bold text-sm hover:opacity-70 transition-opacity"
            >
              Hesabım
            </Link>
          ) : (
            <Link
              to="/hasta-girisi"
              className="hidden md:block text-primary font-bold text-sm hover:opacity-70 transition-opacity"
            >
              Hasta Girişi
            </Link>
          )}
          <Button variant="primary" size="sm" onClick={onOpenChat}>
            Randevu Al
          </Button>
        </div>

        <button
          className="md:hidden text-secondary hover:text-primary transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
          {links.map((l) =>
            l.external ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            )
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setOpen(false);
              onOpenChat();
            }}
          >
            Randevu Al
          </Button>
        </div>
      )}
    </nav>
  );
}
