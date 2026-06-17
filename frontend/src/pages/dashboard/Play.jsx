import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, Shuffle, ArrowRight, Zap, Timer, Clock } from "lucide-react";

const GAMES = [
  {
    key: "qcm",
    icon: HelpCircle,
    iconColor: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    hoverBorder: "hover:border-primary/30",
    hoverGlow: "bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent",
    glowColor: "bg-primary/10",
    title: "QCM",
    sub: "Quiz à choix multiples · classé",
    badge: null,
    route: "/dashboard/play/qcm/config",
    modes: [
      { icon: Zap,   label: "Blitz",   time: "2 min",  pts: "+15 pts/q" },
      { icon: Timer, label: "Rush",    time: "5 min",  pts: "+10 pts/q" },
      { icon: Clock, label: "Classic", time: "10 min", pts: "+8 pts/q"  },
    ],
  },
  {
    key: "smatch",
    icon: Shuffle,
    iconColor: "text-white/55",
    iconBg: "bg-white/[0.04] border-white/[0.08]",
    hoverBorder: "hover:border-white/20",
    hoverGlow: "bg-gradient-to-b from-orange-500/[0.05] to-transparent",
    glowColor: "bg-orange-500/10",
    title: "Smatch",
    sub: "Speed matching · réflexes",
    badge: "NEW",
    badgeClass: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    route: "/dashboard/play/smatch/config",
    modes: [
      { icon: Timer, label: "Time Attack", time: "90s",  pts: "+10 pts" },
      { icon: Clock, label: "Zen",         time: "∞",    pts: "+5 pts"  },
      { icon: Zap,   label: "Survival",    time: "120s", pts: "+15 pts" },
    ],
  },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="px-5 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-3 md:grid-cols-2">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: EASE_OUT_EXPO }}
                onClick={() => navigate(game.route)}
                className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] cursor-pointer select-none ${game.hoverBorder} transition-all duration-500`}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 ${game.hoverGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                {/* Ambient glow */}
                <div className={`pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full ${game.glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                <div className="relative p-6 flex flex-col gap-5">

                  {/* Title row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${game.iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${game.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black leading-none tracking-tight text-white">{game.title}</h2>
                          {game.badge && (
                            <span className={`text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5 ${game.badgeClass}`}>
                              {game.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{game.sub}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Mode list */}
                  <div className="space-y-1.5">
                    {game.modes.map((m) => {
                      const MIcon = m.icon;
                      return (
                        <div key={m.label} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.025] border border-white/[0.04]">
                          <MIcon className="h-3 w-3 text-white/25 shrink-0" />
                          <span className="text-xs font-semibold text-white/65 flex-1">{m.label}</span>
                          <span className="text-xs font-mono text-white/25">{m.time}</span>
                          <span className="text-xs font-black text-primary">{m.pts}</span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
