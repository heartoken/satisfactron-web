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
import { RatingsSummary } from "@/components/ratings-summary";
import { MealsTabContent } from "@/components/meals-tab-content";
import { HistoryTabContent } from "@/components/history-tab-content";

interface DevicePageProps {
  params: Promise<{
    deviceId: string;
  }>;
}

import { createClient } from "gel";
import { ClientOnly } from "@/components/client-only";

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
  start_time: any;
  end_time: any;
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

function serializeTimeObject(timeObj: any): string {
  if (typeof timeObj === 'string') return timeObj;
  if (timeObj && typeof timeObj === 'object' && 'hour' in timeObj && 'minute' in timeObj) {
    return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`;
  }
  return '00:00';
}

function getMealPeriodForVote(
  vote: Vote,
  mealPeriods: any[]
): any | null {
  // Extract UTC time as HH:MM format for comparison
  const voteDate = new Date(vote.created_at);
  const utcHours = voteDate.getUTCHours().toString().padStart(2, '0');
  const utcMinutes = voteDate.getUTCMinutes().toString().padStart(2, '0');
  const voteTime = `${utcHours}:${utcMinutes}`;

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

function calculateMealStats(votes: Vote[], mealPeriods: any[]) {
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
  mealPeriods: any[],
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

  const result: { date: string;[mealName: string]: number | string }[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0];
    const dayData: { date: string;[mealName: string]: number | string } = {
      date: dateKey,
    };

    mealPeriods.forEach((meal) => {
      const votesForDay = dailyStats[dateKey]?.[meal.id] || [];
      const count = votesForDay.length;
      const average =
        count > 0
          ? votesForDay.reduce((sum, vote) => sum + vote.value, 0) / count
          : 0;
      dayData[meal.name] = Math.round(average * 100) / 100;
      dayData[`${meal.name}_count`] = count; // Add vote count
    });

    result.push(dayData);
  }

  return result;
}

// Create a client wrapper component for the tabs
function DevicePageTabs({
  stats,
  serializedMealPeriods,
  mealStats,
  evolutionData
}: {
  stats: Device;
  serializedMealPeriods: any[];
  mealStats: any[];
  evolutionData: any[];
}) {
  return (
    <ClientOnly>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="meals">Par repas</TabsTrigger>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            <ChartRatings votes={stats.votes} />
            <RatingsSummary votes={stats.votes} />
          </div>
        </TabsContent>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-6">
          <MealsTabContent
            mealPeriods={serializedMealPeriods}
            mealStats={mealStats}
            votes={stats.votes}
          />
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="space-y-6">
          {serializedMealPeriods.length > 0 && evolutionData.length > 0 ? (
            <MealEvolutionChart
              data={evolutionData}
              mealNames={serializedMealPeriods.map((m) => m.name)}
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
                    {serializedMealPeriods.length === 0
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
          <HistoryTabContent
            votes={stats.votes}
            mealPeriods={serializedMealPeriods}
          />
        </TabsContent>
      </Tabs>
    </ClientOnly>
  );
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

  // Serialize meal periods for client components
  const serializedMealPeriods = mealPeriods.map(meal => ({
    id: meal.id,
    name: meal.name,
    start_time: serializeTimeObject(meal.start_time),
    end_time: serializeTimeObject(meal.end_time),
    is_active: meal.is_active
  }));

  const mealStats = calculateMealStats(stats.votes, serializedMealPeriods);
  const evolutionData = getDailyMealEvolution(stats.votes, serializedMealPeriods);

  return (
    <DevicePageClient pollingInterval={5000}>
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

        <DevicePageTabs
          stats={stats}
          serializedMealPeriods={serializedMealPeriods}
          mealStats={mealStats}
          evolutionData={evolutionData}
        />
      </div>
    </DevicePageClient>
  );
}