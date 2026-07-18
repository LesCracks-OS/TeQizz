import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Timer, Infinity, Heart, ArrowLeft, Loader2, Layers } from "lucide-react";
import smatchGameService from "../../services/smatchGame.service";

const MODES = [
  { key: "TIME_ATTACK", label: "Time Attack", sub: "90 secondes", icon: Timer, color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/8", glow: "bg-orange-500/10", desc: "Associez un maximum de paires avant la fin du chrono. Chaque seconde compte." },
  { key: "ZEN", label: "Zen", sub: "Sans chrono", icon: Infinity, color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/8", glow: "bg-yellow-500/10", desc: "Prenez votre temps. Sans pression, associez à votre rythme. Idéal pour réviser." },
  { key: "SURVIVAL", label: "Survival", sub: "3 vies", icon: Heart, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/8", glow: "bg-red-500/10", desc: "Chaque mauvaise association vous coûte une vie. Chaque erreur est pénalisante." },
];

const DIFF_COLORS = {
  EASY: "text-emerald-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

export default function SmatchGameConfig() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    smatchGameService.getDecks()
      .then(d => setDecks(d ?? []))
      .catch(() => setError("Impossible de charger les decks"))
      .finally(() => setLoadingDecks(false));
  }, []);

  const canStart = selectedMode && selectedDeck && !starting;

  const start = async () => {
    if (!canStart) return;
    setStarting(true); setError("");
    // Remember the last config so "Rejouer" can relaunch instantly without reconfiguring.
    try { localStorage.setItem("teqizz:lastSmatchConfig", JSON.stringify({ deckId: selectedDeck.id, gameMode: selectedMode })); } catch { /* ignore */ }
    try {
      const session = await smatchGameService.startSession({ deckId: selectedDeck.id, gameMode: selectedMode });
      navigate(`/dashboard/play/smatch/${session.sessionId}`);
    } catch (e) {
      setError(e?.message || "Impossible de démarrer la partie");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        <button onClick={() => navigate("/dashboard/play")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/15">
            <Puzzle className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-none">Smatch</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Association rapide</p>
          </div>
        </div>

        {/* Mode */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Choisir un mode</p>
          <div className="space-y-3">
            {MODES.map((mode, i) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.key;
              return (
                <motion.div key={mode.key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`group relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all ${isSelected ? `${mode.border} ${mode.bg} brightness-110` : "border-border bg-card hover:bg-muted/20"}`}
                  onClick={() => setSelectedMode(mode.key)}>
                  <div className="relative flex items-center gap-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 ${isSelected ? `${mode.border} bg-card` : "border-border bg-muted/20"}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? mode.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black">{mode.label}</h3>
                        <span className="text-xs text-muted-foreground">{mode.sub}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mode.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deck */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Choisir un deck</p>
          {loadingDecks ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : decks.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Aucun deck disponible pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {decks.map(deck => {
                const isSelected = selectedDeck?.id === deck.id;
                return (
                  <button key={deck.id} onClick={() => setSelectedDeck(deck)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${isSelected ? "border-orange-500/40 bg-orange-500/8" : "border-border bg-card hover:bg-muted/20"}`}>
                    <div className="h-9 w-9 rounded-xl border border-border bg-muted/20 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{deck.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[11px] font-semibold ${DIFF_COLORS[deck.difficulty] ?? "text-muted-foreground"}`}>{deck.difficulty}</span>
                        <span className="text-[11px] text-muted-foreground">{deck.pairCount} paires</span>
                        {deck.categoryName && <span className="text-[11px] text-muted-foreground">· {deck.categoryName}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <AnimatePresence>
          {selectedMode && selectedDeck && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              disabled={!canStart} onClick={start}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600 transition-colors disabled:opacity-50">
              {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Puzzle className="h-5 w-5" />}
              {starting ? "Démarrage…" : `Commencer — ${MODES.find(m => m.key === selectedMode)?.label}`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
