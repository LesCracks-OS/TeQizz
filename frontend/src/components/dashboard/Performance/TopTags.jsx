import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const topTags = [
  { rank: 1, name: "React", percentage: "95%", questionsPlayed: 45 },
  { rank: 2, name: "JavaScript", percentage: "88%", questionsPlayed: 32 },
  { rank: 3, name: "Node.js", percentage: "82%", questionsPlayed: 28 },
];

const TopTags = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Top 3 Tech Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topTags.map((tag) => (
            <div
              key={tag.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rang */}
              <div className="flex items-center justify-center w-8 h-8">
                {tag.rank <= 3 ? (
                  <Trophy
                    className={`w-5 h-5 ${
                      tag.rank === 1
                        ? "text-yellow-500"
                        : tag.rank === 2
                        ? "text-gray-400"
                        : "text-amber-600"
                    }`}
                  />
                ) : (
                  <span className="text-sm font-medium">{tag.rank}</span>
                )}
              </div>

              {/* Nom du tag */}
              <div className="flex-1">
                <p className="font-medium">{tag.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tag.questionsPlayed} questions answered
                </p>
              </div>

              {/* Pourcentage */}
              <div className="text-right">
                <p className="font-semibold text-primary">{tag.percentage}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopTags;
