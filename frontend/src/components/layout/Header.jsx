import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Github } from "lucide-react";
import AuthModal from "../auth/AuthModal";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [stars, setStars] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("https://api.github.com/repos/LesCracks-OS/TeQizz")
      .then(r => r.json())
      .then(d => { if (d.stargazers_count !== undefined) setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  const open = (mode) => { setAuthMode(mode); setAuthOpen(true); };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all duration-300">
        <div
          className={`flex items-center justify-between w-full transition-all duration-300 ${
            scrolled
              ? "max-w-5xl bg-[#0d0d0d]/90 backdrop-blur-xl border border-white/8 px-6 py-3 rounded-2xl shadow-2xl shadow-black/50"
              : "max-w-7xl px-2 py-3"
          }`}
        >
          <Link to="/" className="text-xl font-black tracking-tighter text-white">
            TeQizz<span className="text-primary">.</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/LesCracks-OS/TeQizz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 text-white/35 hover:text-white/70 hover:border-white/20 transition-all text-xs"
            >
              <Github className="h-3.5 w-3.5" />
              <Star className="h-3 w-3 text-yellow-400/60" />
              <span className="font-black tabular-nums">{stars !== null ? stars.toLocaleString("fr-FR") : "—"}</span>
            </a>
            <button
              onClick={() => open("login")}
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white/45 hover:text-white/80 transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => open("signup")}
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:brightness-110 hover:shadow-primary/35 transition-all"
            >
              Commencer
            </button>
          </div>
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </>
  );
};

export default Header;
