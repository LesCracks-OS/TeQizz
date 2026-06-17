import { useEffect, useState } from "react";
import { Clock, Star, Heart, Zap } from "lucide-react";
import adminService from "@/services/admin.service";

const MODE_STYLES = {
  BLITZ: { border: "border-purple-500/30", bg: "bg-purple-500/5", icon: "text-purple-500" },
  RUSH: { border: "border-blue-500/30", bg: "bg-blue-500/5", icon: "text-blue-500" },
  CLASSIC: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", icon: "text-emerald-500" },
};

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminQcmConfig() {
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getQcmConfig()
      .then(r => setModes(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">QCM Game Modes</h2>
        <p className="text-sm text-muted-foreground mt-1">Read-only configuration. Edit in source code to change parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map(mode => {
          const style = MODE_STYLES[mode.name] ?? { border: "border-border", bg: "bg-card", icon: "text-foreground" };
          return (
            <div key={mode.name} className={`rounded-xl border ${style.border} ${style.bg} p-5 space-y-4`}>
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center`}>
                  <Zap className={`h-5 w-5 ${style.icon}`} />
                </div>
                <div>
                  <p className="font-bold">{mode.displayName}</p>
                  <p className="text-xs text-muted-foreground">{mode.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatPill icon={Clock} label="Initial time" value={mode.hasTimer ? `${mode.initialTimeSeconds}s` : "No timer"} />
                <StatPill icon={Star} label="Points/correct" value={`+${mode.pointsPerCorrect}`} />
                {mode.hasTimer && (
                  <>
                    <StatPill icon={Clock} label="Time bonus" value={`+${mode.timeBonusSeconds}s`} />
                    <StatPill icon={Clock} label="Time penalty" value={`-${mode.timePenaltySeconds}s`} />
                  </>
                )}
                {mode.hasLives && (
                  <StatPill icon={Heart} label="Lives" value={mode.maxLives} />
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {mode.hasTimer && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-card border border-border text-muted-foreground">Timer</span>
                )}
                {mode.hasLives && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-card border border-border text-muted-foreground">Lives</span>
                )}
                {!mode.hasTimer && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-500">Zen mode</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
