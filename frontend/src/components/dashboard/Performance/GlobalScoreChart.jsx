import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2.5 shadow-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-1">{label}</p>
      <p className="text-lg font-black tabular-nums text-white">
        {payload[0].value}
        <span className="text-xs font-normal text-white/30 ml-1">pts</span>
      </p>
      {payload[0].payload.date && (
        <p className="text-[10px] text-white/25 mt-0.5">{payload[0].payload.date}</p>
      )}
    </div>
  );
};

const GlobalScoreChart = ({ recentGames = [], averageScore = 0 }) => {
  const data = recentGames
    .slice(0, 10)
    .reverse()
    .map((game, i) => ({
      label: `G${i + 1}`,
      score: game.score || 0,
      date: game.completedAt ? new Date(game.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '',
    }));

  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-white/20 text-sm">
        Aucune partie jouée
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Évolution du score</p>
        <p className="text-xs text-white/30">
          Moy. <span className="font-black text-white/60">{Math.round(averageScore)} pts</span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.20)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

          <ReferenceLine
            y={averageScore}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="4 4"
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary, #6366f1)"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
            dot={{ fill: 'var(--color-primary, #6366f1)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--color-primary, #6366f1)', stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlobalScoreChart;
