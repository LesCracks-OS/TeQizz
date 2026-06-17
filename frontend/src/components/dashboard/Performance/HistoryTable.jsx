import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Heart, BadgeCheck } from "lucide-react";

const historyData = [
  {
    date: "2024-01-15",
    mode: "QCM",
    category: "Frontend",
    score: 850,
    accuracy: "85%",
    timeRemaining: "12s",
    livesRemaining: 2,
  },
  {
    date: "2024-01-14",
    mode: "QCM",
    category: "Backend",
    score: 720,
    accuracy: "72%",
    timeRemaining: "8s",
    livesRemaining: 1,
  },
  {
    date: "2024-01-13",
    mode: "QCM",
    category: "Database",
    score: 950,
    accuracy: "95%",
    timeRemaining: "18s",
    livesRemaining: 3,
  },
  {
    date: "2024-01-12",
    mode: "QCM",
    category: "DevOps",
    score: 680,
    accuracy: "68%",
    timeRemaining: "5s",
    livesRemaining: 0,
  },
  {
    date: "2024-01-11",
    mode: "QCM",
    category: "Security",
    score: 890,
    accuracy: "89%",
    timeRemaining: "15s",
    livesRemaining: 2,
  },
];

const HistoryTable = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Game History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Time Left</TableHead>
              <TableHead>Lives</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.map((game, index) => (
              <TableRow key={index}>
                <TableCell className="text-muted-foreground">
                  {new Date(game.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{game.mode}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {game.category}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{game.score}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-green-500" />
                    {game.accuracy}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {game.timeRemaining}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    {game.livesRemaining}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistoryTable;
