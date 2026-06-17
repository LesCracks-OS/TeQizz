import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const skills = [
  { name: "Frontend", value: 85 },
  { name: "Backend", value: 72 },
  { name: "DevOps", value: 68 },
  { name: "Database", value: 78 },
  { name: "Security", value: 65 },
  { name: "Mobile", value: 55 },
];

const SkillRadarChart = () => {
  // Calculate points for the radar chart (hexagon)
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 90;
  
  const getPoint = (index, value, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const total = skills.length;
  const skillPoints = skills.map((skill, index) => getPoint(index, skill.value, total));
  const pathData = skillPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Background hexagon levels
  const levels = [25, 50, 75, 100];
  const levelPaths = levels.map((level) => {
    const points = skills.map((_, index) => getPoint(index, level, total));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Tech Skills Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* SVG Radar Chart */}
          <svg width="240" height="240" viewBox="0 0 240 240" className="mb-4">
            {/* Background levels */}
            {levelPaths.map((path, index) => (
              <path
                key={index}
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/50"
              />
            ))}
            
            {/* Axis lines */}
            {skills.map((_, index) => {
              const point = getPoint(index, 100, total);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border/30"
                />
              );
            })}
            
            {/* Data polygon */}
            <path
              d={pathData}
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            
            {/* Data points */}
            {skillPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="currentColor"
                className="text-primary"
              />
            ))}
          </svg>

          {/* Labels */}
          <div className="grid grid-cols-3 gap-2 w-full text-sm">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between px-2 py-1 rounded bg-muted/50">
                <span className="text-muted-foreground">{skill.name}</span>
                <span className="font-semibold">{skill.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillRadarChart;