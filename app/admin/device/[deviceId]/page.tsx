import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Star,
  TrendingUp,
  Vote,
  Utensils,
  BarChart3,
  Settings,
} from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { StarRating } from "@/components/star-rating";
import { DevicePageClient } from "@/components/device-page-client";
import { DynamicTimeAgo } from "@/components/dynamic-time-ago";
import { ChartRatings } from "@/components/chart-ratings";
import { MealEvolutionChart } from "@/components/meal-evolution-chart";

interface DevicePageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

import { createClient } from "gel";

type Device = {
  id: string;
  name: string;
  votes: Vote[];
};

type Vote = {
  id: string;
  value: number;
  created_at: string;
  device: Device;
};

type MealPeriod = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

const client = createClient();

async function getDeviceStats(deviceId: string): Promise<Device | null> {
  try {
    const result = await client.query(
      `
      select Device {
        id,
        name,
        votes: {
          id,
          value,
          created_at,
          device: { id, name }
        }
      } filter .id = <uuid>$deviceId;
    `,
      { deviceId }
    );

    return (result as Device[])[0] || null;
  } catch (error) {
    console.error("Failed to fetch device:", error);
    return null;
  }
}

async function getMealPeriods(): Promise<MealPeriod[]> {
  try {
    const result = await client.query(`
      select MealPeriod {
        id,
        name,
        start_time,
        end_time,
        is_active
      } filter .is_active = true
      order by .start_time;
    `);

    return (result as MealPeriod[]) || [];
  } catch (error) {
    console.error("Failed to fetch meal periods:", error);
    return [];
  }
}

function getMealPeriodForVote(
  vote: Vote,
  mealPeriods: MealPeriod[]
): MealPeriod | null {
  const voteTime = new Date(vote.created_at).toTimeString().slice(0, 5);

  return (
    mealPeriods.find((meal) => {
      return (
        voteTime >= meal.start_time &&
        voteTime <= meal.end_time &&
        meal.is_active
      );
    }) || null
  );
}

function calculateMealStats(votes: Vote[], mealPeriods: MealPeriod[]) {
  const mealVotes: { [mealId: string]: Vote[] } = {};

  votes.forEach((vote) => {
    const meal = getMealPeriodForVote(vote, mealPeriods);
    if (meal) {
      if (!mealVotes[meal.id]) {
        mealVotes[meal.id] = [];
      }
      mealVotes[meal.id].push(vote);
    }
  });

  return mealPeriods.map((meal) => {
    const votesForMeal = mealVotes[meal.id] || [];
    const totalVotes = votesForMeal.length;
    const averageRating =
      totalVotes > 0
        ? votesForMeal.reduce((sum, vote) => sum + vote.value, 0) / totalVotes
        : 0;

    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    votesForMeal.forEach((vote) => {
      distribution[vote.value]++;
    });

    return {
      id: meal.id,
      name: meal.name,
      timeRange: `${meal.start_time} - ${meal.end_time}`,
      totalVotes,
      averageRating: Math.round(averageRating * 100) / 100,
      distribution,
      votes: votesForMeal,
    };
  });
}

function getDailyMealEvolution(
  votes: Vote[],
  mealPeriods: MealPeriod[],
  days: number = 14
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const dailyStats: { [date: string]: { [mealId: string]: Vote[] } } = {};

  votes.forEach((vote) => {
    const voteDate = new Date(vote.created_at);
    if (voteDate >= startDate && voteDate <= endDate) {
      const dateKey = voteDate.toISOString().split("T")[0];
      const meal = getMealPeriodForVote(vote, mealPeriods);

      if (meal) {
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {};
        }
        if (!dailyStats[dateKey][meal.id]) {
          dailyStats[dateKey][meal.id] = [];
        }
        dailyStats[dateKey][meal.id].push(vote);
      }
    }
  });

  const result: { date: string; [mealName: string]: number | string }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];
    const dayData: { date: string; [mealName: string]: number | string } = {
      date: dateKey,
    };

    mealPeriods.forEach((meal) => {
      const votesForDay = dailyStats[dateKey]?.[meal.id] || [];
      const average =
        votesForDay.length > 0
          ? votesForDay.reduce((sum, vote) => sum + vote.value, 0) /
            votesForDay.length
          : 0;
      dayData[meal.name] = Math.round(average * 100) / 100;
    });

    result.push(dayData);
  }

  return result;
}

// Disable caching for this page
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DevicePage({ params }: DevicePageProps) {
  const { deviceId } = await params;
  const [stats, mealPeriods] = await Promise.all([
    getDeviceStats(deviceId),
    getMealPeriods(),
  ]);

  if (!stats) {
    notFound();
  }

  const mealStats = calculateMealStats(stats.votes, mealPeriods);
  const evolutionData = getDailyMealEvolution(stats.votes, mealPeriods);

  function toHHMM(timeObj: { hour: number; minute: number }): string {
    return (
      String(timeObj.hour).padStart(2, "0") +
      ":" +
      String(timeObj.minute).padStart(2, "0")
    );
  }

  const currentTime = new Date().toTimeString().slice(0, 5); // e.g. "14:30"

  const currentMeal = mealPeriods.find((meal) => {
    const start = toHHMM(meal.start_time); // e.g. "14:00"
    const end = toHHMM(meal.end_time); // e.g. "15:00"
    return currentTime >= start && currentTime <= end;
  });

  return (
    <DevicePageClient pollingInterval={1000}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{stats.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">
                    ID: {stats.id.slice(0, 8)}...
                  </p>
                  <CopyButton textToCopy={stats.id} />
                </div>
                {currentMeal && (
                  <Badge
                    variant="default"
                    className="bg-emerald-100 text-emerald-800"
                  >
                    <Utensils className="w-3 h-3 mr-1" />
                    En cours: {currentMeal.name}
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/admin/device/${stats.id}`}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Administration
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="meals">Par repas</TabsTrigger>
            <TabsTrigger value="evolution">Évolution</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Rating Chart */}
            <ChartRatings votes={stats.votes} />

            {/* Overall Summary */}
            <Card className="w-full relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <StarRating
                  rating={
                    stats.votes.length > 0
                      ? stats.votes.reduce(
                          (sum: number, vote: Vote) => sum + vote.value,
                          0
                        ) / stats.votes.length
                      : 0
                  }
                  size="md"
                />
                <span className="text-lg font-semibold text-foreground">
                  {stats.votes.length > 0
                    ? (
                        stats.votes.reduce(
                          (sum: number, vote: Vote) => sum + vote.value,
                          0
                        ) / stats.votes.length
                      ).toFixed(1)
                    : "0.0"}{" "}
                  sur 5
                </span>
              </div>
              <CardHeader>
                <CardTitle>Avis des clients</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Basé sur {stats.votes.length} évaluation
                  {stats.votes.length !== 1 ? "s" : ""} clients
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.votes.filter(
                    (vote) => vote.value === rating
                  ).length;
                  const percentage =
                    stats.votes.length > 0
                      ? (count / stats.votes.length) * 100
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-4 text-sm"
                    >
                      <div className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            fill={i < rating ? "#f59e0b" : "none"}
                            color={i < rating ? "#f59e0b" : "#d1d5db"}
                            strokeWidth={2}
                          />
                        ))}
                      </div>
                      <Progress value={percentage} className="h-2 flex-grow" />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                        <span className="text-muted-foreground">({count})</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            {mealPeriods.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mealStats.map((meal) => (
                  <Card key={meal.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Utensils className="w-5 h-5 mr-2 text-muted-foreground" />
                          {meal.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          <Vote className="w-3 h-3 mr-1" />
                          {meal.totalVotes}
                        </Badge>
                      </div>
                      <CardDescription>{meal.timeRange}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {meal.totalVotes > 0 ? (
                        <>
                          {/* Average Rating */}
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold">
                                  {meal.averageRating}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  / 5
                                </span>
                              </div>
                              <StarRating
                                rating={meal.averageRating}
                                size="sm"
                              />
                            </div>
                          </div>

                          {/* Distribution */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Répartition
                            </p>
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = meal.distribution[rating];
                              const percentage =
                                meal.totalVotes > 0
                                  ? (count / meal.totalVotes) * 100
                                  : 0;

                              return (
                                <div
                                  key={rating}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <span className="w-4">{rating}★</span>
                                  <Progress
                                    value={percentage}
                                    className="h-1 flex-grow"
                                  />
                                  <span className="w-8 text-muted-foreground">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Utensils className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Aucun avis pour ce repas
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucune période de repas configurée
                    </h3>
                    <p className="text-muted-foreground">
                      Les analyses par repas seront disponibles une fois les
                      périodes configurées.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="space-y-6">
            {mealPeriods.length > 0 && evolutionData.length > 0 ? (
              <MealEvolutionChart
                data={evolutionData}
                mealNames={mealPeriods.map((m) => m.name)}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Données d'évolution non disponibles
                    </h3>
                    <p className="text-muted-foreground">
                      {mealPeriods.length === 0
                        ? "Configurez les périodes de repas pour voir l'évolution."
                        : "Pas assez de données pour afficher l'évolution."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique complet des votes</CardTitle>
                <CardDescription>
                  Tous les avis reçus par cet appareil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.votes
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((vote: Vote) => {
                      const voteMeal = getMealPeriodForVote(vote, mealPeriods);
                      return (
                        <div
                          key={vote.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <StarRating rating={vote.value} size="md" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                <DynamicTimeAgo dateString={vote.created_at} />
                              </p>
                              {voteMeal && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Utensils className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {voteMeal.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {new Date(vote.created_at).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {stats.votes.length === 0 && (
                  <div className="text-center py-8">
                    <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucun vote enregistré
                    </h3>
                    <p className="text-muted-foreground">
                      Cet appareil n'a pas encore reçu de votes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DevicePageClient>
  );
}
