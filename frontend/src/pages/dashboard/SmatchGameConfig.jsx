import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Timer, Infinity, Heart, ArrowLeft, Construction } from "lucide-react";

const MODES = [
  {
    key: "TIME_ATTACK",
    label: "Time Attack",
    sub: "90 secondes",
    icon: Timer,
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/8",
    glow: "bg-orange-500/10",
    desc: "Associez un maximum de paires avant la fin du chrono. Chaque seconde compte.",
  },
  {
    key: "ZEN",
    label: "Zen",
    sub: "Sans chrono",
    icon: Infinity,
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/8",
    glow: "bg-yellow-500/10",
    desc: "Prenez votre temps. Sans pression, associez à votre rythme. Idéal pour réviser.",
  },
  {
    key: "SURVIVAL",
    label: "Survival",
    sub: "120 secondes",
    icon: Heart,
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/8",
    glow: "bg-red-500/10",
    desc: "Plus de temps mais chaque mauvaise association vous coûte une vie. Chaque erreur est pénalisante.",
  },
];

export default function SmatchGameConfig() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);

  const handleModeClick = (key) => {
    setSelectedMode(key);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard/play")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/15">
            <Shuffle className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-none">Smatch</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Association rapide</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Choisir un mode</p>
          <div className="space-y-3">
            {MODES.map((mode, i) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.key;
              return (
                <motion.div
                  key={mode.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`group relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? `${mode.border} ${mode.bg} brightness-110`
                      : "border-border bg-card hover:bg-muted/20"
                  }`}
                  onClick={() => handleModeClick(mode.key)}
                >
                  {isSelected && (
                    <div className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full ${mode.glow} blur-2xl`} />
                  )}
                  <div className="relative flex items-center gap-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 ${
                      isSelected ? `${mode.border} bg-card` : "border-border bg-muted/20"
                    }`}>
                      <Icon className={`h-6 w-6 ${isSelected ? mode.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black">{mode.label}</h3>
                        <span className="text-xs text-muted-foreground">{mode.sub}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mode.desc}</p>
                    </div>
                    <ArrowLeft className={`h-5 w-5 rotate-180 transition-all ${
                      isSelected ? `${mode.color} opacity-100 translate-x-1` : "opacity-0 text-muted-foreground"
                    }`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Coming soon notice — only visible after selecting a mode */}
        <AnimatePresence>
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 shrink-0">
                <Construction className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold">Gameplay en cours de développement</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Le mode <span className="font-semibold text-foreground">{MODES.find(m => m.key === selectedMode)?.label}</span> sera disponible très prochainement.
                  Le moteur de jeu Smatch est en cours de construction.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
