"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type EvolutionData = {
  date: string;
  [mealName: string]: number | string;
};

type MealEvolutionChartProps = {
  data: EvolutionData[];
  mealNames: string[];
};

const COLORS = [
  "#8884d8", // Blue
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff7c7c", // Red
  "#8dd1e1", // Light Blue
  "#d084d0", // Purple
];

export function MealEvolutionChart({
  data,
  mealNames,
}: MealEvolutionChartProps) {
  const formatXAxisDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM", { locale: fr });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">
            {format(new Date(label), "dd MMMM yyyy", { locale: fr })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}:{" "}
              {entry.value > 0 ? `${entry.value}/5` : "Aucun avis"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Filter data to show only days with at least one vote
  const filteredData = data.filter((day) =>
    mealNames.some((meal) => (day[meal] as number) > 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des notes par repas</CardTitle>
        <CardDescription>
          Moyennes quotidiennes sur les 14 derniers jours
          {filteredData.length > 0 &&
            ` (${filteredData.length} jours avec des avis)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Note /5",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {mealNames.map((mealName, index) => (
                  <Line
                    key={mealName}
                    type="monotone"
                    dataKey={mealName}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{
                      fill: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                      r: 4,
                    }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground mb-2">
                Aucune donnée d'évolution disponible
              </p>
              <p className="text-sm text-muted-foreground">
                Les données apparaîtront au fur et à mesure des avis reçus
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
