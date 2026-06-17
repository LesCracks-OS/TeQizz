import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const scoreData = [
  { day: "Mon", score: 650 },
  { day: "Tue", score: 720 },
  { day: "Wed", score: 680 },
  { day: "Thu", score: 850 },
  { day: "Fri", score: 780 },
  { day: "Sat", score: 920 },
  { day: "Sun", score: 890 },
];

const ScoreEvolutionChart = () => {
  const maxScore = Math.max(...scoreData.map((d) => d.score));
  const minScore = Math.min(...scoreData.map((d) => d.score));
  const avgScore = Math.round(
    scoreData.reduce((acc, d) => acc + d.score, 0) / scoreData.length
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Score Evolution (Last 7 Days)</CardTitle>
          <div className="text-sm text-muted-foreground">
            Avg: <span className="font-semibold text-foreground">{avgScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple CSS Line Chart */}
        <div className="relative h-48">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxScore}</span>
            <span>{Math.round((maxScore + minScore) / 2)}</span>
            <span>{minScore}</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-40 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-b border-border/50" />
              <div className="border-b border-border/50" />
              <div className="border-b border-border/50" />
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-2">
              {scoreData.map((data, index) => {
                const height = ((data.score - minScore) / (maxScore - minScore)) * 100;
                return (
                  <div
                    key={data.day}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-8 bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${data.score} pts`}
                    />
                    <span className="text-xs text-muted-foreground">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Daily Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreEvolutionChart;