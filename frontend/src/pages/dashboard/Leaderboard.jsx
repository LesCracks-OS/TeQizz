import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartNoAxesCombined, Loader2, Crown, Medal, Award, Braces, Puzzle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import qcmGameService from "@/services/qcmGame.service";

const EASE = [0.16, 1, 0.3, 1];

const getInitials = (u) => u?.slice(0, 2).toUpperCase() || "??";

// Difficulty reached — the primary driver of rank, surfaced so the ranking reads as fair.
const DIFF_BADGE = {
  EASY:   "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  MEDIUM: "text-yellow-400 border-yellow-500/25 bg-yellow-500/10",
  HARD:   "text-orange-400 border-orange-500/25 bg-orange-500/10",
  EXPERT: "text-red-400 border-red-500/25 bg-red-500/10",
};

const QCM_MODES = [
  { key: "ALL",     label: "Tous" },
  { key: "BLITZ",   label: "Blitz" },
  { key: "RUSH",    label: "Rush" },
  { key: "CLASSIC", label: "Classic" },
];

const PODIUM_CFG = [
  { place: 1, order: 2, height: "h-32 sm:h-40", color: "#F59E0B", glow: "bg-yellow-400/20", ring: "ring-yellow-400/50", size: "h-20 w-20 sm:h-24 sm:w-24" },
  { place: 2, order: 1, height: "h-24 sm:h-28", color: "#94A3B8", glow: "bg-slate-400/10",  ring: "ring-slate-400/40",  size: "h-16 w-16 sm:h-20 sm:w-20" },
  { place: 3, order: 3, height: "h-16 sm:h-20", color: "#B45309", glow: "bg-amber-700/10",  ring: "ring-amber-700/40",  size: "h-16 w-16 sm:h-20 sm:w-20" },
];

function PodiumSlot({ entry, cfg, delay }) {
  const isFirst = cfg.place === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={{ order: cfg.order }}
      className="flex flex-col items-center gap-2"
    >
      {isFirst && (
        <Crown className="h-5 w-5 mb-0.5" style={{ color: cfg.color }} />
      )}

      <div className="relative">
        <div className={`absolute inset-0 rounded-full blur-xl ${cfg.glow} scale-150`} />
        <Avatar className={`${cfg.size} ring-2 ${cfg.ring} relative`}>
          <AvatarImage src={entry.avatarUrl} />
          <AvatarFallback className="text-xs font-black bg-white/5 text-white/60">
            {getInitials(entry.username)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="text-center">
        <p className="text-sm font-black text-white/80 max-w-[110px] truncate">{entry.username}</p>
        <p className="text-2xl font-black tabular-nums mt-0.5" style={{ color: cfg.color }}>
          {Math.round(entry.compositeScore ?? 0)}
          <span className="text-[10px] font-normal text-white/25 ml-1">rating</span>
        </p>
        {entry.highestDifficulty && (
          <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${DIFF_BADGE[entry.highestDifficulty] ?? "text-white/30 border-white/10"}`}>
            {entry.highestDifficulty}
          </span>
        )}
      </div>

      <div
        className={`w-24 sm:w-28 rounded-t-2xl flex items-end justify-center pb-3 text-3xl font-black ${cfg.height}`}
        style={{
          background: `linear-gradient(to top, ${cfg.color}22, ${cfg.color}08)`,
          border: `1px solid ${cfg.color}25`,
          color: cfg.color,
        }}
      >
        {cfg.place}
      </div>
    </motion.div>
  );
}

function QcmLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameMode, setGameMode] = useState("ALL");
  const [me, setMe] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    qcmGameService
      .getLeaderboard({ page: 0, size: 50, gameMode })
      .then(r => setEntries(r.data?.entries || r.entries || []))
      .catch(e => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [gameMode]);

  // Player's own (global) standing — used to pin a "you" row when out of the visible top.
  useEffect(() => {
    qcmGameService.getUserStats().then(s => setMe(s?.data ?? s)).catch(() => setMe(null));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const meVisible = user?.id && entries.some(e => String(e.userId) === String(user.id));
  const showMyRow = gameMode === "ALL" && me && (me.leaderboardPosition > 0) && !meVisible;

  const medalIcon = (rank) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mode pills */}
      <div className="flex flex-wrap gap-2">
        {QCM_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGameMode(key)}
            className={`px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm font-black transition-all duration-200 ${
              gameMode === key
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/[0.07] text-white/30 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-28">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 border border-primary/20 rounded-full">
                <Award className="h-4 w-4 text-primary" />
              </div>
            </div>
          </motion.div>
        )}

        {error && !loading && (
          <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 text-sm text-red-400/70">{error}</motion.p>
        )}

        {!loading && !error && entries.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-28 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/2">
              <Award className="h-7 w-7 text-white/15" />
            </div>
            <p className="text-sm text-white/25">Aucun joueur pour ce mode — soyez le premier.</p>
          </motion.div>
        )}

        {!loading && !error && entries.length > 0 && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Podium */}
            {top3.length >= 2 && (
              <div className="relative rounded-3xl border border-white/[0.07] bg-white/2 p-8 pt-10 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-yellow-400/[0.03] to-transparent" />
                <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-400/[0.06] blur-3xl rounded-full" />
                <div className="relative flex items-end justify-center gap-5">
                  {top3.map((entry, i) => {
                    const cfg = PODIUM_CFG.find(c => c.place === entry.rank);
                    return cfg
                      ? <PodiumSlot key={entry.userId} entry={entry} cfg={cfg} delay={i * 0.1} />
                      : null;
                  })}
                </div>
              </div>
            )}

            {/* Full rank list */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-3 border-b border-white/[0.06]">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20">#</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20">Joueur</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 hidden sm:block text-right">Précision</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 hidden md:block text-right">Parties</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 text-right">Rating</span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {entries.map((entry, i) => {
                  const isTop3 = entry.rank <= 3;
                  const isMe = user?.id && (entry.userId === user.id || entry.userId === String(user.id));
                  return (
                    <motion.div
                      key={entry.userId || entry.rank}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.5), ease: EASE }}
                      className={`grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-4 sm:px-6 py-4 transition-colors ${
                        isMe
                          ? "bg-primary/[0.06] border-l-2 border-l-primary/50"
                          : isTop3
                          ? "bg-white/1.5"
                          : "hover:bg-white/1.5"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">
                        {isTop3 ? medalIcon(entry.rank) : (
                          <span className="text-sm font-mono text-white/25">{entry.rank}</span>
                        )}
                      </div>

                      {/* Player */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 ring-1 ring-white/10">
                          <AvatarImage src={entry.avatarUrl} />
                          <AvatarFallback className="text-xs font-black bg-white/5 text-white/50">
                            {getInitials(entry.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className={`text-sm sm:text-base truncate ${isTop3 ? "font-black text-white/90" : "font-semibold text-white/70"}`}>
                            {entry.username}
                            {isMe && <span className="ml-2 text-[10px] font-black text-primary/70 uppercase tracking-wider">vous</span>}
                          </p>
                          {entry.highestDifficulty && (
                            <span className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${DIFF_BADGE[entry.highestDifficulty] ?? "text-white/30 border-white/10"}`}>
                              {entry.highestDifficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Accuracy */}
                      <div className="hidden sm:block text-right">
                        <span className={`text-sm font-bold tabular-nums ${
                          (entry.accuracy || 0) >= 75 ? "text-emerald-400"
                          : (entry.accuracy || 0) >= 50 ? "text-yellow-400"
                          : "text-white/30"
                        }`}>
                          {(entry.accuracy || 0).toFixed(0)}%
                        </span>
                      </div>

                      {/* Games */}
                      <div className="hidden md:block text-right">
                        <span className="text-xs text-white/25 tabular-nums">{entry.gamesPlayed}</span>
                      </div>

                      {/* Rating (fair composite — same value that decides the rank) */}
                      <div className="text-right">
                        <span className={`text-lg sm:text-xl font-black tabular-nums ${isTop3 ? "text-primary" : "text-white/70"}`}>
                          {Math.round(entry.compositeScore ?? 0)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Your own standing, pinned when you're outside the visible top */}
            {showMyRow && (
              <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 sm:px-6 py-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-mono text-primary/70">{me.leaderboardPosition}</span>
                </div>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 ring-1 ring-primary/30">
                    <AvatarImage src={me.avatarUrl || user?.avatarUrl} />
                    <AvatarFallback className="text-xs font-black bg-primary/20 text-primary">
                      {getInitials(me.username || user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-black text-white/90 truncate">
                      {me.username || user?.username}
                      <span className="ml-2 text-[10px] font-black text-primary/70 uppercase tracking-wider">vous</span>
                    </p>
                    {me.highestDifficultyReached && (
                      <span className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${DIFF_BADGE[me.highestDifficultyReached] ?? "text-white/30 border-white/10"}`}>
                        {me.highestDifficultyReached}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-black tabular-nums text-primary">{Math.round(me.rating ?? 0)}</span>
              </div>
            )}

            <p className="text-[10px] text-white/20 text-right font-semibold uppercase tracking-wider">
              {entries.length} joueur{entries.length > 1 ? "s" : ""} classé{entries.length > 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SmatchLeaderboard() {
  return (
    <div className="flex flex-col items-center py-28 gap-5">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl scale-125" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/8">
          <Puzzle className="h-7 w-7 text-orange-400" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-base font-black text-white/60">Smatch leaderboard</h3>
        <p className="text-sm text-white/25 mt-1">Bientôt disponible — jouez Smatch pour être le premier.</p>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState("qcm");

  return (
    <div className="px-5 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}
        className="flex items-center gap-4">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
          <ChartNoAxesCombined className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">Classement</h1>
          <p className="text-xs sm:text-sm text-white/30 mt-1">Le rating récompense la difficulté atteinte, pas le volume.</p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-2xl border border-white/[0.07] bg-white/2 w-full sm:w-fit">
        {[
          { key: "qcm",    icon: Braces, label: "QCM" },
          { key: "smatch", icon: Puzzle, label: "Smatch" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
              tab === key
                ? "bg-white/[0.07] text-white shadow-sm"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "qcm" ? <QcmLeaderboard /> : <SmatchLeaderboard />}
    </div>
  );
}
