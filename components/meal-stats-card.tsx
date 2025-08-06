import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { Clock, Utensils } from "lucide-react";

type MealStats = {
  mealName: string;
  totalVotes: number;
  averageRating: number;
  distribution: { [key: number]: number };
};

type MealStatsCardProps = {
  mealStats: MealStats[];
  deviceName: string;
  deviceId: string;
  totalVotes: number;
  overallAverage: number;
};

export function MealStatsCard({
  mealStats,
  deviceName,
  deviceId,
  totalVotes,
  overallAverage,
}: MealStatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{deviceName}</CardTitle>
          <Badge variant="secondary">
            <Utensils className="w-3 h-3 mr-1" />
            {totalVotes}
          </Badge>
        </div>
        <CardDescription>
          Statistiques par repas • Cliquez pour voir les détails
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Moyenne générale
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">{overallAverage}</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
          </div>
          <StarRating rating={overallAverage} size="sm" />
        </div>

        {/* Meal Stats */}
        <div className="space-y-3">
          {mealStats.map((meal, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{meal.mealName}</p>
                  <p className="text-xs text-muted-foreground">
                    {meal.totalVotes} vote{meal.totalVotes !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {meal.totalVotes > 0 ? (
                  <>
                    <span className="text-sm font-semibold">
                      {meal.averageRating}
                    </span>
                    <StarRating rating={meal.averageRating} size="lg" />
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Aucun vote
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Best Meal Indicator */}
        {mealStats.length > 0 && (
          <div className="pt-2 border-t">
            {(() => {
              const bestMeal = mealStats.reduce(
                (best, current) =>
                  current.totalVotes > 0 &&
                    current.averageRating > best.averageRating
                    ? current
                    : best,
                { mealName: "", averageRating: 0, totalVotes: 0 }
              );

              return bestMeal.totalVotes > 0 ? (
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-emerald-600">🏆</span>
                  <span className="text-muted-foreground">
                    Meilleur: {bestMeal.mealName}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
