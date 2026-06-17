import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Shuffle, HelpCircle, Heart, Trophy,
  Clock, ChevronDown, PenLine, Code2, HandHeart,
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const LIVE_FEED = [
  { user: "axelr",    val: "940 pts",    mode: "Blitz",    ago: "2m" },
  { user: "sophiabe", val: "rank #12",   mode: "Classic",  ago: "5m" },
  { user: "mrquiz",   val: "1 240 pts",  mode: "Rush",     ago: "8m" },
  { user: "lena_k",   val: "streak 7j",  mode: "",         ago: "12m" },
  { user: "devhub",   val: "780 pts",    mode: "Blitz",    ago: "15m" },
  { user: "camille7", val: "rank #3",    mode: "Classic",  ago: "18m" },
  { user: "noxvoid",  val: "1 080 pts",  mode: "Survival", ago: "22m" },
  { user: "julek",    val: "860 pts",    mode: "Rush",     ago: "27m" },
];

const FAQ_ITEMS = [
  {
    q: "C'est quoi TeQizz ?",
    a: "Une plateforme de quiz pour les passionnés de tech. Deux jeux : QCM pour tester tes connaissances sous pression, Smatch pour associer termes et définitions en temps limité.",
  },
  {
    q: "Pour qui c'est fait ?",
    a: "Pour tous ceux qui s'intéressent à la tech — devs, étudiants, SRE, data scientists, passionnés de cybersécurité. Si tu veux tester et renforcer tes fondamentaux, TeQizz est fait pour toi.",
  },
  {
    q: "C'est gratuit ?",
    a: "Oui. Créer un compte suffit. Aucune limitation sur le nombre de parties. Le classement global et les statistiques détaillées sont accessibles à tous.",
  },
  {
    q: "Comment contribuer à l'évolution de la plateforme ?",
    a: "TeQizz est open source. Tu peux contribuer en soumettant des questions via la page Contribuer (QCM ou Smatch), en signalant des bugs ou en proposant des fonctionnalités sur GitHub, ou en soutenant financièrement le projet. Chaque contribution, petite ou grande, aide la plateforme à grandir.",
  },
];

const DEMO_ANSWERS = [
  { l: "A", text: "Couche transport" },
  { l: "B", text: "Couche application" },
  { l: "C", text: "Couche réseau" },
  { l: "D", text: "Couche liaison" },
];

const CONTRIBUTE_ITEMS = [
  {
    Icon: PenLine,
    title: "Contenu",
    body: "Enrichis la plateforme en soumettant du contenu — questions, ressources, corrections — pour faire évoluer les jeux.",
  },
  {
    Icon: Code2,
    title: "Code",
    body: "Signale des bugs, propose de nouvelles fonctionnalités ou contribue directement au code source de la plateforme.",
  },
  {
    Icon: HandHeart,
    title: "Soutien",
    body: "Aide à financer l'hébergement et le développement pour que TeQizz reste gratuit et continue d'évoluer.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE QCM DEMO CARD
// ─────────────────────────────────────────────────────────────────────────────

function GameCard() {
  const [picked, setPicked] = useState(null);
  const CORRECT = 1;
  const revealed = picked !== null;

  return (
    <div className="relative w-full max-w-[520px] select-none">
      <div className="absolute -inset-4 rounded-3xl bg-primary/15 blur-2xl pointer-events-none" />
      <div className="relative rounded-2xl border border-white/[0.09] bg-[#111]/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/70">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-black/50">
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <Heart key={i} className="h-4 w-4 fill-red-500 text-red-500" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-sm text-white/40">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-black text-white">2:14</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/15 border border-primary/20 rounded-full px-3 py-1">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-black text-primary">360</span>
          </div>
        </div>

        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/25">Q05</span>
            <span className="text-[10px] font-black tracking-wider text-yellow-400/70 border border-yellow-400/20 bg-yellow-400/10 rounded px-2 py-0.5">
              MEDIUM
            </span>
          </div>
          <p className="text-base font-semibold leading-snug text-white/90">
            DNS opère sur quelle couche du modèle OSI ?
          </p>
        </div>

        <div className="px-5 pb-5 space-y-2">
          {DEMO_ANSWERS.map((a, i) => {
            const sel = picked === i;
            const cor = i === CORRECT;
            let card = "border-white/[0.06] bg-white/[0.02] hover:border-white/20";
            let badge = "bg-white/[0.07] text-white/40";
            if (revealed) {
              if (cor)      { card = "border-emerald-500/40 bg-emerald-500/10";  badge = "bg-emerald-500/25 text-emerald-300"; }
              else if (sel) { card = "border-red-500/30 bg-red-500/[0.07]";      badge = "bg-red-500/20 text-red-300"; }
            } else if (sel) { card = "border-primary/40 bg-primary/10";          badge = "bg-primary/20 text-primary"; }
            return (
              <button
                key={i}
                onClick={() => !revealed && setPicked(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${card}`}
              >
                <span className={`w-7 h-7 shrink-0 rounded-lg text-xs font-black flex items-center justify-center ${badge}`}>
                  {a.l}
                </span>
                <span className="text-sm font-medium text-white/75">{a.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {picked === CORRECT && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.9], y: [0, -20, -50, -80] }}
            transition={{ duration: 1.8 }}
            className="absolute -top-2 right-4 bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg pointer-events-none"
          >
            +20 pts
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE ACTIVITY BAR
// ─────────────────────────────────────────────────────────────────────────────

function LiveBar() {
  return (
    <div className="relative overflow-hidden bg-[#050505] border-y border-white/[0.05] py-3">
      <div className="absolute left-0 inset-y-0 z-10 flex items-center pl-4 pr-14 bg-gradient-to-r from-[#050505] via-[#050505] to-transparent pointer-events-none">
        <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] uppercase text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="absolute right-0 inset-y-0 z-10 w-20 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none" />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap pl-28 font-mono"
      >
        {[...LIVE_FEED, ...LIVE_FEED].map((f, i) => (
          <span key={i} className="flex items-center gap-3 text-[11px] shrink-0">
            <span className="text-white/25">{f.ago}</span>
            <span className="text-white/70 font-semibold">{f.user}</span>
            <span className="text-primary font-black">{f.val}</span>
            {f.mode && (
              <span className="text-[10px] text-white/25 border border-white/[0.07] rounded px-1.5 py-0.5">
                {f.mode}
              </span>
            )}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────────────────────

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className="border-b border-white/[0.07] last:border-0"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-6 py-6 text-left group"
      >
        <span className="text-[11px] font-black tabular-nums text-white/20 w-6 shrink-0 pt-0.5 group-hover:text-primary transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm font-semibold text-white/65 group-hover:text-white/90 transition-colors leading-relaxed">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown className={`h-4 w-4 transition-colors ${open ? "text-primary" : "text-white/20"}`} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pl-12 pb-6 text-sm text-white/38 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const heroRef = useRef(null);

  const open = (mode) => { setAuthMode(mode); setAuthOpen(true); };

  // Cursor-tracking spotlight — CSS vars only, zero re-renders
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const fn = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${e.clientX - r.left}px`);
      el.style.setProperty("--cy", `${e.clientY - r.top}px`);
    };
    el.addEventListener("mousemove", fn);
    return () => el.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div className="bg-[#080808] text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col"
        style={{
          background:
            "radial-gradient(700px circle at var(--cx,35%) var(--cy,40%), oklch(0.62 0.19 260/.08) 0%, transparent 60%), #080808",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,.055) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#080808] to-transparent" />

        <div className="relative flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-20 pt-24 pb-16 lg:pt-28 lg:pb-24 max-w-[1400px] mx-auto w-full">
          <div className="max-w-3xl xl:max-w-[52%]">

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-4 flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] text-white/30 uppercase"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              2 845 joueurs en ligne
            </motion.p>

            <h1 className="text-[clamp(2rem,5.5vw,5rem)] font-black leading-[0.9] tracking-[-0.03em]">
              {[
                { text: "PROUVE QUE", accent: false },
                { text: "TU SAIS CE QUE", accent: false },
                { text: "TU FAIS.", accent: true },
              ].map(({ text, accent }, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
                    className={accent ? "text-primary" : ""}
                  >
                    {text}
                  </motion.div>
                </div>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.82, duration: 0.5 }}
              className="mt-8 max-w-[520px] space-y-2"
            >
              <p className="text-[15px] font-semibold text-white/70 leading-snug">
                La tech, ça se partage. Et ça se mesure.
              </p>
              <p className="text-sm text-white/38 leading-relaxed">
                Une plateforme pensée pour tous ceux qui vivent de la tech — ou
                rêvent d'y entrer. Révise tes bases, découvre de nouveaux
                concepts, affronte les meilleurs. Que tu sois en école, en
                reconversion ou en poste, ta place est ici.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.97, duration: 0.45 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <button
                onClick={() => open("signup")}
                className="group inline-flex items-center gap-2 bg-primary rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:brightness-110 hover:shadow-primary/35 transition-all"
              >
                Commencer — c'est gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => open("login")}
                className="inline-flex items-center px-8 py-4 rounded-full text-sm font-semibold text-white/40 border border-white/[0.09] hover:border-white/25 hover:text-white/70 transition-all"
              >
                Connexion
              </button>
            </motion.div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="mt-12 pt-8 border-t border-white/[0.07] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/[0.07]"
            >
              {[
                { val: "2.8K+", label: "joueurs" },
                { val: "50K+",  label: "questions" },
                { val: "1.2M",  label: "parties" },
                { val: "30+",   label: "pays" },
              ].map(s => (
                <div key={s.label} className="sm:px-6 first:pl-0 last:pr-0">
                  <p className="text-2xl font-black tabular-nums">{s.val}</p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/25 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:block">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, duration: 0.9, ease: EASE_OUT_EXPO }}
              style={{
                rotateY: -12,
                rotateX: 5,
                transformPerspective: 1200,
                filter: "drop-shadow(0px 40px 80px rgba(0,0,0,0.85))",
              }}
            >
              <GameCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  LIVE BAR                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <LiveBar />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  GAMES BENTO                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-20 max-w-[1400px] mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-14"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/25 mb-4">
            Les arènes
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black leading-[0.9] tracking-tight">
            Choisis.<br />
            <span className="text-white/25">Joue. Grimpe.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── QCM ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            onClick={() => open("signup")}
            className="lg:col-span-2 group relative rounded-3xl border border-white/[0.07] bg-white/[0.015] p-8 lg:p-10 cursor-pointer overflow-hidden hover:border-primary/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row gap-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black leading-none tracking-tight">QCM</h3>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mt-0.5">
                      Quiz à choix multiples
                    </p>
                  </div>
                </div>

                <p className="text-sm text-white/45 leading-relaxed mb-8 max-w-xs">
                  Timer global, 3 vies, difficulté progressive EASY → EXPERT.
                  Chaque partie compte dans ton classement global.
                </p>

                <div className="space-y-2">
                  {[
                    { name: "Blitz",   time: "2 min",  pts: "+15 pts/q", note: "Pression max" },
                    { name: "Rush",    time: "5 min",  pts: "+10 pts/q", note: "Rythme soutenu" },
                    { name: "Classic", time: "10 min", pts: "+8 pts/q",  note: "Réflexion profonde" },
                  ].map(m => (
                    <div
                      key={m.name}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/10 transition-colors"
                    >
                      <span className="text-xs font-black w-14 text-white">{m.name}</span>
                      <span className="text-xs text-white/30 flex-1">{m.note}</span>
                      <span className="text-xs text-white/35 font-mono">{m.time}</span>
                      <span className="text-xs text-primary font-black">{m.pts}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:w-[260px] shrink-0 flex items-center justify-center py-2">
                <GameCard />
              </div>
            </div>

            <div className="relative mt-8 flex items-center gap-2 text-xs text-white/25 group-hover:text-white/60 transition-colors">
              Jouer maintenant
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* ── SMATCH ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT_EXPO }}
            onClick={() => open("signup")}
            className="group relative rounded-3xl border border-white/[0.07] bg-white/[0.015] p-8 lg:p-10 cursor-pointer overflow-hidden hover:border-white/20 transition-all duration-500 flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative flex-1">
              <div className="flex items-start justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Shuffle className="h-5 w-5 text-white/55" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/20 bg-primary/10 rounded-full px-2.5 py-1">
                  NEW
                </span>
              </div>

              <h3 className="text-4xl font-black leading-none tracking-tight mb-1">SMATCH</h3>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-6">Speed matching</p>

              <p className="text-sm text-white/45 leading-relaxed mb-10">
                Associe termes et définitions avant la fin du timer. Le jeu
                le plus addictif pour ancrer les concepts tech.
              </p>

              <div className="divide-y divide-white/[0.05]">
                {[
                  { name: "Time Attack", time: "90s",  pts: "+10 pts" },
                  { name: "Zen",         time: "∞",    pts: "+5 pts"  },
                  { name: "Survival",    time: "120s", pts: "+15 pts" },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between py-3.5">
                    <span className="text-xs font-semibold text-white/65">{m.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/30">{m.time}</span>
                      <span className="text-xs font-black text-white/45">{m.pts}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 flex items-center gap-2 text-xs text-white/25 group-hover:text-white/60 transition-colors">
              Découvrir
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MANIFESTO / CTA                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-36 px-6 sm:px-10 lg:px-20 overflow-hidden border-y border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,.016) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.06] blur-[100px]" />

        <div className="relative max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-black uppercase tracking-[0.28em] text-white/20 mb-10"
          >
            Notre conviction
          </motion.p>

          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "80%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
              className="text-[clamp(1.85rem,4.5vw,4rem)] font-black leading-[1.07] tracking-[-0.02em]"
            >
              Travailler dans la tech sans maîtriser ses fondamentaux,{" "}
              <span className="text-white/30">c'est construire sur du sable.</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28, duration: 0.6 }}
            className="mt-8 text-white/40 text-[15px] leading-relaxed max-w-md"
          >
            TeQizz te challenge. Pas pour te noter — pour révéler ce que tu
            ne sais pas encore et transformer ça en force.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.42, duration: 0.5 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <button
              onClick={() => open("signup")}
              className="group inline-flex items-center gap-2 bg-white text-black rounded-full px-10 py-4 text-sm font-black hover:bg-white/90 transition-all shadow-2xl shadow-white/10"
            >
              Rejoindre l'arène
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => open("login")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white/40 border border-white/[0.1] hover:text-white/70 hover:border-white/25 transition-all"
            >
              J'ai déjà un compte
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  CONTRIBUTE                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-20 max-w-[1400px] mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/25 mb-4">
            Communauté · Open
          </p>
          <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black leading-[0.9] tracking-tight">
            Tu écris.<br />
            <span className="text-white/25">La communauté joue.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {CONTRIBUTE_ITEMS.map(({ Icon, title, body }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: EASE_OUT_EXPO }}
              className="rounded-3xl border border-white/[0.07] bg-white/[0.015] p-8"
            >
              <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                <Icon className="h-5 w-5 text-white/50" />
              </div>
              <p className="text-lg font-black text-white mb-3">{title}</p>
              <p className="text-sm text-white/40 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-white/[0.07] bg-white/[0.015] px-8 py-7"
        >
          <div>
            <p className="text-base font-bold text-white mb-1">
              La plateforme évolue grâce à sa communauté.
            </p>
            <p className="text-sm text-white/40">
              Chacun contribue à sa façon — contenu, code ou soutien financier.
            </p>
          </div>
          <button
            onClick={() => open("signup")}
            className="group shrink-0 inline-flex items-center gap-2 bg-white text-black rounded-full px-7 py-3.5 text-sm font-black hover:bg-white/90 transition-all whitespace-nowrap"
          >
            Contribuer
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  FAQ                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 sm:px-10 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/20 mb-4">
              Questions fréquentes
            </p>
            <h2 className="text-[clamp(3rem,8vw,7rem)] font-black leading-none tracking-tight">
              FAQ
            </h2>
          </motion.div>

          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  );
}
