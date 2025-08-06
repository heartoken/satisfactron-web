"use client";

import { useMemo } from "react";
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
import { enUS } from "date-fns/locale";

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
  // Memoize filtered data to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    return data.filter((day) =>
      mealNames.some((meal) => (day[meal] as number) > 0)
    );
  }, [data, mealNames]);

  // Memoize chart lines to prevent recreation on every render
  const chartLines = useMemo(() => {
    return mealNames.map((mealName, index) => (
      <Line
        key={`meal-line-${mealName}-${index}`} // More stable key
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
        isAnimationActive={false} // Disable animations to prevent DOM issues
      />
    ));
  }, [mealNames]);

  const formatXAxisDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MM/dd", { locale: enUS });
    } catch (error) {
      return dateString;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">
            {format(new Date(label), "MMMM dd, yyyy", { locale: enUS })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}:{" "}
              {entry.value > 0 ? `${entry.value}/5` : "No reviews"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Evolution by Meal</CardTitle>
        <CardDescription>
          Daily averages over the last 14 days
          {filteredData.length > 0 &&
            ` (${filteredData.length} days with reviews)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
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
                    value: "Rating /5",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {chartLines}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-center">
            <div>
              <p className="text-muted-foreground mb-2">
                No evolution data available
              </p>
              <p className="text-sm text-muted-foreground">
                Data will appear as reviews are received
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}