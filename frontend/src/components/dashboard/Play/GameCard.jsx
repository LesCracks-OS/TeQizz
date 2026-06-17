import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Heart, Star, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const GameCard = ({
  title,
  description,
  icon: Icon,
  rules,
  isActive = true,
  onPlay,
  comingSoon = false,
}) => {
  if (comingSoon && !isActive) {
    return (
      <Card className="relative overflow-hidden">
        {/* Effet blur */}
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm z-10" />
        
        {/* Overlay Coming Soon */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg">
            Bientôt disponible
          </div>
        </div>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {rule.icon}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" disabled>
            Bientôt disponible
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", !isActive && "opacity-60")}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Règles */}
          <div className="flex flex-wrap gap-4 text-sm">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
                {rule.icon}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onPlay}
          disabled={!isActive}
        >
          {isActive ? "Lancer" : "Bientôt disponible"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
