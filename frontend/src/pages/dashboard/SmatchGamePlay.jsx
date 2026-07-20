import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Timer, Medal, ArrowLeft, RotateCcw, Loader2, Check } from "lucide-react";
import smatchGameService from "../../services/smatchGame.service";
import AnimatedNumber from "../../components/dashboard/AnimatedNumber";

const TIMER_SECONDS = { TIME_ATTACK: 90, SURVIVAL: 120, ZEN: null };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SmatchGamePlay() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [matched, setMatched] = useState(() => new Set());
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [wrong, setWrong] = useState(null); // { termId, defId }
  const [submitting, setSubmitting] = useState(false);

  const [lives, setLives] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [result, setResult] = useState(null);

  const [replaying, setReplaying] = useState(false);
  const finishedRef = useRef(false);
  const attemptStartRef = useRef(Date.now());

  // Replay instantly with the same deck + mode — no reconfiguration.
  const handleReplay = async () => {
    setReplaying(true);
    let cfg = null;
    try { cfg = JSON.parse(localStorage.getItem("teqizz:lastSmatchConfig")); } catch { /* ignore */ }
    if (!cfg) { navigate("/dashboard/play/smatch/config"); return; }
    try {
      const s = await smatchGameService.startSession(cfg);
      navigate(`/dashboard/play/smatch/${s.sessionId}`);
    } catch {
      setReplaying(false);
      navigate("/dashboard/play/smatch/config");
    }
  };

  // Load session + deck pairs. Also resets transient state so an in-place replay
  // (same route, new sessionId) starts from a clean board.
  useEffect(() => {
    let cancelled = false;
    finishedRef.current = false;
    setMatched(new Set());
    setSelectedTerm(null);
    setSelectedDef(null);
    setWrong(null);
    setResult(null);
    setReplaying(false);
    setLoading(true);
    (async () => {
      try {
        const s = await smatchGameService.getSession(sessionId);
        const deck = await smatchGameService.getDeck(s.deckId);
        if (cancelled) return;
        setSession(s);
        setPairs(deck.pairs ?? []);
        setLives(s.livesRemaining);
        setScore(s.totalScore ?? 0);
        setTimeLeft(TIMER_SECONDS[s.gameMode] ?? null);
      } catch {
        if (!cancelled) setLoadError("Impossible de charger la partie");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  const termCards = useMemo(() => shuffle(pairs.map(p => ({ pairId: p.id, text: p.term }))), [pairs]);
  const defCards = useMemo(() => shuffle(pairs.map(p => ({ pairId: p.id, text: p.definition }))), [pairs]);

  const finish = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      const r = await smatchGameService.getResults(sessionId);
      setResult(r);
    } catch {
      setResult({ deckName: session?.deckName, totalScore: score, pairsMatched: matched.size, totalPairs: pairs.length });
    }
  };

  // Countdown for timed modes.
  useEffect(() => {
    if (timeLeft == null || loading || result) return;
    if (timeLeft <= 0) {
      smatchGameService.abandonSession(sessionId).catch(() => {}).finally(finish);
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, result]);

  // Submit once both a term and a definition are picked.
  useEffect(() => {
    if (selectedTerm == null || selectedDef == null || submitting || result) return;
    const termId = selectedTerm;
    const defId = selectedDef;
    setSubmitting(true);
    (async () => {
      try {
        const res = await smatchGameService.submitAttempt(sessionId, {
          termPairId: termId,
          definitionPairId: defId,
          timeTakenMs: Date.now() - attemptStartRef.current,
        });
        attemptStartRef.current = Date.now();
        setScore(res.totalScore);
        if (typeof res.livesRemaining === "number") setLives(res.livesRemaining);

        if (res.correct && !res.alreadyMatched) {
          setMatched(prev => new Set(prev).add(termId));
          setSelectedTerm(null);
          setSelectedDef(null);
        } else if (res.correct && res.alreadyMatched) {
          setSelectedTerm(null);
          setSelectedDef(null);
        } else {
          setWrong({ termId, defId });
          setTimeout(() => {
            setWrong(null);
            setSelectedTerm(null);
            setSelectedDef(null);
          }, 650);
        }

        if (res.sessionCompleted || res.gameOver) finish();
      } catch {
        setSelectedTerm(null);
        setSelectedDef(null);
      } finally {
        setSubmitting(false);
      }
    })();
  }, [selectedTerm, selectedDef]); // eslint-disable-line react-hooks/exhaustive-deps

  const clickTerm = (pairId) => {
    if (submitting || wrong || matched.has(pairId) || result) return;
    setSelectedTerm(prev => (prev === pairId ? null : pairId));
  };
  const clickDef = (pairId) => {
    if (submitting || wrong || matched.has(pairId) || result) return;
    setSelectedDef(prev => (prev === pairId ? null : pairId));
  };

  const cardClass = (pairId, selectedId, isWrong) => {
    if (matched.has(pairId)) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 opacity-60 cursor-default";
    if (isWrong) return "border-red-500/50 bg-red-500/10 text-red-400";
    if (selectedId === pairId) return "border-orange-500/50 bg-orange-500/10 text-orange-300";
    return "border-border bg-card hover:bg-muted/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-red-500">{loadError}</p>
        <button onClick={() => navigate("/dashboard/play")} className="px-5 py-2.5 rounded-2xl border border-border text-sm hover:bg-muted transition-colors">Retour</button>
      </div>
    );
  }

  const totalPairs = pairs.length;
  const hasTimer = timeLeft != null;
  const hasLives = typeof lives === "number";

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* HUD */}
        <div className="flex items-center justify-between">
          <button onClick={() => {
              if (result || window.confirm("Quitter la partie ? Ta progression sera perdue.")) {
                smatchGameService.abandonSession(sessionId).catch(() => {});
                navigate("/dashboard/play");
              }
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Quitter
          </button>
          <div className="flex items-center gap-4 text-sm">
            {hasTimer && (
              <span className={`flex items-center gap-1.5 font-bold ${timeLeft <= 10 ? "text-red-400" : "text-foreground"}`}>
                <Timer className="h-4 w-4" /> {timeLeft}s
              </span>
            )}
            {hasLives && (
              <span className="flex items-center gap-1.5 font-bold text-red-400">
                <Heart className="h-4 w-4 fill-current" /> {lives}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-bold text-orange-400">
              <Medal className="h-4 w-4" /> <AnimatedNumber value={score} pop />
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{session?.deckName}</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${totalPairs ? (matched.size / totalPairs) * 100 : 0}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{matched.size} / {totalPairs} paires associées</p>
        </div>

        {/* Board */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Termes</p>
            {termCards.map(c => (
              <button key={`t-${c.pairId}`} onClick={() => clickTerm(c.pairId)}
                className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${cardClass(c.pairId, selectedTerm, wrong?.termId === c.pairId)}`}>
                {matched.has(c.pairId) ? <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5" /> {c.text}</span> : c.text}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Définitions</p>
            {defCards.map(c => (
              <button key={`d-${c.pairId}`} onClick={() => clickDef(c.pairId)}
                className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all ${cardClass(c.pairId, selectedDef, wrong?.defId === c.pairId)}`}>
                {c.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result overlay */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm text-center space-y-5">
            <div className="h-14 w-14 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto">
              <Medal className="h-7 w-7 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Partie terminée !</h3>
              <p className="text-sm text-muted-foreground mt-1">{result.deckName}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-lg font-black text-orange-400">{result.totalScore ?? score}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-lg font-black">{result.pairsMatched ?? matched.size}/{result.totalPairs ?? totalPairs}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Paires</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-lg font-black">{result.wrongAttempts ?? 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Erreurs</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/dashboard/play")} className="flex-1 py-3 rounded-2xl border border-border text-sm font-bold hover:bg-muted transition-colors">
                Retour
              </button>
              <button onClick={handleReplay} disabled={replaying} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {replaying ? "Relance…" : "Rejouer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
