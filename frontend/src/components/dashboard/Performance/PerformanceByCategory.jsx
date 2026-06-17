import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const categories = [
  { name: "Frontend", percentage: 85, color: "bg-blue-500" },
  { name: "Backend", percentage: 72, color: "bg-green-500" },
  { name: "DevOps", percentage: 68, color: "bg-yellow-500" },
  { name: "Database", percentage: 78, color: "bg-purple-500" },
  { name: "Security", percentage: 65, color: "bg-red-500" },
  { name: "Mobile", percentage: 55, color: "bg-cyan-500" },
];

const PerformanceByCategory = () => {
  const maxPercentage = Math.max(...categories.map((c) => c.percentage));
  const dominantCategory = categories.find((c) => c.percentage === maxPercentage);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Performance by Tech Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Catégorie dominante mise en évidence */}
          {dominantCategory && (
            <div className="p-3 rounded-lg bg-primary/10 mb-4">
              <p className="text-sm text-muted-foreground">Strongest Domain</p>
              <p className="text-lg font-semibold">{dominantCategory.name} ({dominantCategory.percentage}%)</p>
            </div>
          )}

          {/* Barres de progression */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">{category.percentage}%</span>
                </div>
                <Progress
                  value={category.percentage}
                  className="h-2"
                  indicatorClassName={category.color}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceByCategory;
