import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Trophy, Target, Brain, Zap, Loader2, Flame,
  BarChart3, Star, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import GlobalScoreChart from "@/components/dashboard/Performance/GlobalScoreChart";
import qcmGameService from "@/services/qcmGame.service";

const EASE = [0.16, 1, 0.3, 1];

const difficultyColor = {
  EASY:   { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "#22c55e" },
  MEDIUM: { text: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20",  bar: "#eab308" },
  HARD:   { text: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",  bar: "#f97316" },
  EXPERT: { text: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",        bar: "#ef4444" },
};

const modeColor = {
  BLITZ:   { text: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/[0.06]" },
  RUSH:    { text: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/[0.06]" },
  CLASSIC: { text: "text-emerald-400",border: "border-emerald-500/20",bg: "bg-emerald-500/[0.06]" },
};

function AccuracyRing({ value }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  const color = value >= 70 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-black leading-none" style={{ color }}>{Math.round(value)}%</p>
      </div>
    </div>
  );
}

const ModeTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2 shadow-xl text-xs">
      <p className="font-black text-white/80">{payload[0].payload.gameMode}</p>
      <p className="text-white/40 mt-0.5">{payload[0].name}: <span className="text-white/70 font-bold">{payload[0].value}</span></p>
    </div>
  );
};

export default function PerformancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    qcmGameService.getUserStats()
      .then(r => setStats(r.data || r))
      .catch(e => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded-full">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <XCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-white/40">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalGamesPlayed === 0) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Stats · QCM</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Performance.</h1>
        <div className="flex flex-col items-center py-28 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/2">
            <Target className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="text-base font-black text-white/50">Aucune donnée pour l'instant</h3>
          <p className="text-sm text-white/25">Jouez quelques parties pour voir vos stats ici.</p>
        </div>
      </div>
    );
  }

  const cardClass = "rounded-2xl border border-white/[0.07] bg-white/2 p-6";

  // Build radar data from category stats
  const radarData = (stats.categoryStats || []).slice(0, 6).map(c => ({
    subject: c.categoryName?.length > 10 ? c.categoryName.slice(0, 10) + "…" : c.categoryName,
    value: Math.round(c.accuracy || 0),
  }));

  // Bar chart data from game mode stats
  const modeBarData = (stats.gameModeStats || []).map(m => ({
    gameMode: m.gameMode,
    avg: Math.round(m.averageScore || 0),
    best: m.bestScore || 0,
    acc: Math.round(m.accuracy || 0),
  }));

  const modeBarColors = { BLITZ: "#8b5cf6", RUSH: "#3b82f6", CLASSIC: "#10b981" };

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Stats · QCM</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Performance.</h1>
      </motion.div>

      {/* Hero — leads with the fair rating (the metric that actually decides the rank) */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
        className="relative rounded-2xl border border-white/[0.07] bg-white/2 p-7">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">Rating</p>
            <p className="text-7xl font-black tabular-nums leading-none text-white">
              {Math.round(stats.rating || 0)}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {stats.highestDifficultyReached && (
                <span className={`text-[10px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${difficultyColor[stats.highestDifficultyReached]?.bg || "border-white/10"} ${difficultyColor[stats.highestDifficultyReached]?.text || "text-white/40"}`}>
                  {stats.highestDifficultyReached}
                </span>
              )}
              <span className="text-xs text-white/25">niveau atteint · moy. {Math.round(stats.averageScore || 0)} pts/partie</span>
            </div>
          </div>
          <div className="h-14 w-px bg-white/[0.07] hidden sm:block" />
          <div className="flex flex-col items-center gap-1.5">
            <AccuracyRing value={stats.overallAccuracy || 0} />
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">Précision</p>
            {(stats.recentAccuracy || 0) > (stats.overallAccuracy || 0) && (
              <p className="text-[10px] text-emerald-400 font-black">
                +{((stats.recentAccuracy || 0) - (stats.overallAccuracy || 0)).toFixed(0)}% récemment
              </p>
            )}
          </div>
          <div className="hidden md:block ml-auto text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">Classement</p>
            <p className="text-4xl font-black tabular-nums text-white">#{stats.leaderboardPosition || "–"}</p>
            <p className="text-xs text-white/25">sur {stats.totalPlayers || 0} joueurs</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Trophy,  label: "Meilleur score",  value: stats.bestScore || 0,                               accent: true },
          { icon: Brain,   label: "Parties",          value: stats.totalGamesPlayed,                             accent: false },
          { icon: Flame,   label: "Série",            value: `${stats.currentStreak || 0}j`,                    accent: false },
          { icon: Zap,     label: "Total pts",        value: (stats.totalPointsEarned || 0).toLocaleString(),   accent: false },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className={`rounded-2xl border p-5 flex flex-col gap-2 ${
            accent ? "border-primary/25 bg-primary/6" : "border-white/[0.07] bg-white/2"
          }`}>
            <div className="flex items-center gap-2 text-white/30">
              <Icon className={`h-4 w-4 ${accent ? "text-primary" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
            </div>
            <p className={`text-3xl font-black tabular-nums ${accent ? "text-primary" : "text-white"}`}>{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Correct / Wrong */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.13, ease: EASE }}
        className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400 tabular-nums">{stats.totalCorrectAnswers || 0}</p>
            <p className="text-xs text-white/30 mt-0.5">Bonnes réponses</p>
          </div>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-red-400 tabular-nums">{stats.totalWrongAnswers || 0}</p>
            <p className="text-xs text-white/30 mt-0.5">Mauvaises réponses</p>
          </div>
        </div>
      </motion.div>

      {/* Score history chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16, ease: EASE }}
        className={cardClass}>
        <GlobalScoreChart recentGames={stats.recentGames || []} averageScore={stats.averageScore || 0} />
      </motion.div>

      {/* Category accuracy radar */}
      {radarData.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.19, ease: EASE }}
          className={`${cardClass} space-y-4`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Précision par catégorie</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700 }} />
              <Radar dataKey="value" stroke="var(--color-primary,#6366f1)" strokeWidth={2}
                fill="var(--color-primary,#6366f1)" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Category bars */}
      {stats.categoryStats?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22, ease: EASE }}
          className={`${cardClass} space-y-4`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Par catégorie</p>
          <div className="space-y-3.5">
            {stats.categoryStats.map(cat => {
              const acc = cat.accuracy || 0;
              const color = acc >= 75 ? "#22c55e" : acc >= 50 ? "#eab308" : "#ef4444";
              return (
                <div key={cat.categoryId}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-white/70">{cat.categoryName}</span>
                    <span className="text-xs text-white/30 tabular-nums">
                      {cat.gamesPlayed} partie{cat.gamesPlayed > 1 ? "s" : ""} · {Math.round(cat.averageScore || 0)} pts moy.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${acc}%` }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    </div>
                    <span className="text-xs font-black w-9 text-right tabular-nums" style={{ color }}>
                      {acc.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Game mode bar chart */}
      {modeBarData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25, ease: EASE }}
          className={`${cardClass} space-y-4`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Score moyen par mode</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={modeBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="gameMode" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<ModeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="avg" name="Moy. pts" radius={[6, 6, 0, 0]}>
                {modeBarData.map(entry => (
                  <Cell key={entry.gameMode} fill={modeBarColors[entry.gameMode] || '#6366f1'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {stats.gameModeStats.map(mode => {
              const c = modeColor[mode.gameMode] || { text: "text-white/60", border: "border-white/[0.07]", bg: "bg-white/2" };
              return (
                <div key={mode.gameMode} className={`rounded-xl border p-4 space-y-2.5 ${c.border} ${c.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-wider ${c.text}`}>{mode.gameMode}</span>
                    <span className="text-[10px] text-white/25">{mode.gamesPlayed} parties</span>
                  </div>
                  {[
                    { label: "Moy. score", val: Math.round(mode.averageScore) },
                    { label: "Meilleur",   val: mode.bestScore },
                    { label: "Précision",  val: `${(mode.accuracy || 0).toFixed(0)}%` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-white/30">{label}</span>
                      <span className={`font-black ${c.text}`}>{val}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Best level */}
      {stats.bestPerformingLevel && stats.bestPerformingLevel !== "N/A" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28, ease: EASE }}
          className="rounded-2xl border border-yellow-500/20 bg-yellow-500/4 p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-white/30">Meilleur niveau atteint</p>
            <span className={`inline-block mt-1 text-sm font-black border rounded-lg px-3 py-1 ${difficultyColor[stats.bestPerformingLevel]?.bg || ""} ${difficultyColor[stats.bestPerformingLevel]?.text || ""}`}>
              {stats.bestPerformingLevel}
            </span>
          </div>
        </motion.div>
      )}

      {/* Recent games */}
      {stats.recentGames?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.31, ease: EASE }}
          className="rounded-2xl border border-white/[0.07] bg-white/2 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.07]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Parties récentes</p>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentGames.map((game, i) => {
              const dc = difficultyColor[game.difficultyReached] || {};
              return (
                <motion.div key={game.sessionId}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.32 + i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="text-center w-14 shrink-0">
                    <p className="text-2xl font-black text-primary tabular-nums">{game.score}</p>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider">pts</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/70 truncate">{game.categoryName}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {game.correctAnswers}/{game.totalQuestions} correct · {(game.accuracy || 0).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    {game.difficultyReached && (
                      <span className={`text-[10px] font-black border rounded-lg px-2 py-0.5 ${dc.bg || "border-white/[0.07] text-white/30"} ${dc.text || ""}`}>
                        {game.difficultyReached}
                      </span>
                    )}
                    <p className="text-[10px] text-white/25 flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(game.completedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
