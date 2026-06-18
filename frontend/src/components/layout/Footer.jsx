import { useState, useEffect } from "react";
import { Github, Linkedin, Star } from "lucide-react";

const REPO_URL = "https://github.com/LesCracks-OS/TeQizz";

const Footer = () => {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/LesCracks-OS/TeQizz")
      .then(r => r.json())
      .then(d => { if (d.stargazers_count !== undefined) setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#080808] border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-20 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

        <span className="text-xl font-black tracking-tighter text-white">
          TeQizz<span className="text-primary">.</span>
        </span>

        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono tracking-[0.18em] uppercase text-white/20">
            <span>© {new Date().getFullYear()} TeQizz. Tous droits réservés.</span>
            <div className="flex gap-4 sm:gap-6">
              <a href="/privacy" className="text-xs text-white/40 hover:text-primary transition-colors">Politique de confidentialité</a>
              <a href="/terms"   className="text-xs text-white/40 hover:text-primary transition-colors">CGU</a>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/70 transition-colors"
            title="Voir sur GitHub"
          >
            <Github size={17} />
            {stars !== null && (
              <>
                <Star size={12} className="text-yellow-400/60" />
                <span className="text-xs font-black tabular-nums text-white/40">
                  {stars.toLocaleString("fr-FR")}
                </span>
              </>
            )}
          </a>

          <a
            href="https://www.linkedin.com/company/lescracks/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 hover:text-primary transition-colors"
          >
            <Linkedin size={17} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
