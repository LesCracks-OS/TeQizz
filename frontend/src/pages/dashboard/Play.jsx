import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Braces, Puzzle, ArrowUpRight, Gauge, Timer, Bolt, Joystick } from "lucide-react";

const GAMES = [
  {
    key: "qcm",
    icon: Braces,
    iconColor: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    hoverBorder: "hover:border-primary/30",
    glowColor: "bg-primary/10",
    title: "QCM",
    sub: "Quiz à choix multiples · classé",
    badge: null,
    route: "/dashboard/play/qcm/config",
    modes: [
      { icon: Bolt,  label: "Blitz",   time: "2 min",  pts: "+15 pts/q" },
      { icon: Gauge, label: "Rush",    time: "5 min",  pts: "+10 pts/q" },
      { icon: Timer, label: "Classic", time: "10 min", pts: "+8 pts/q"  },
    ],
  },
  {
    key: "smatch",
    icon: Puzzle,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    hoverBorder: "hover:border-orange-500/30",
    glowColor: "bg-orange-500/10",
    title: "Smatch",
    sub: "Association rapide · réflexes",
    badge: "NEW",
    badgeClass: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    route: "/dashboard/play/smatch/config",
    modes: [
      { icon: Timer, label: "Time Attack", time: "90s",  pts: "+10 pts" },
      { icon: Gauge, label: "Zen",         time: "∞",    pts: "+5 pts"  },
      { icon: Bolt,  label: "Survival",    time: "120s", pts: "+15 pts" },
    ],
  },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="px-5 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto space-y-8 sm:space-y-10">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
          <Joystick className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">Jouer</h1>
          <p className="text-xs sm:text-sm text-white/30 mt-1">Choisis un jeu et un mode. Ta progression compte au classement.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {GAMES.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: EASE_OUT_EXPO }}
              onClick={() => navigate(game.route)}
              className={`group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] cursor-pointer select-none ${game.hoverBorder} transition-colors duration-300`}
            >
              <div className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full ${game.glowColor} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-6 sm:p-8 flex flex-col gap-6">

                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${game.iconBg}`}>
                      <Icon className={`h-7 w-7 ${game.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-black leading-none tracking-tight text-white">{game.title}</h2>
                        {game.badge && (
                          <span className={`text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5 ${game.badgeClass}`}>
                            {game.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/30 uppercase tracking-wider mt-1.5">{game.sub}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/20 group-hover:text-white/70 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* Mode list */}
                <div className="space-y-2">
                  {game.modes.map((m) => {
                    const MIcon = m.icon;
                    return (
                      <div key={m.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
                        <MIcon className="h-4 w-4 text-white/30 shrink-0" />
                        <span className="text-sm font-semibold text-white/70 flex-1">{m.label}</span>
                        <span className="text-xs font-mono text-white/25">{m.time}</span>
                        <span className={`text-xs font-black ${game.iconColor}`}>{m.pts}</span>
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
  );
}
