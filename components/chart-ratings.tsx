"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Star } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive rating chart"

type Vote = {
  id: string
  value: number
  created_at: string
}

type RatingData = {
  date: string
  averageRating: number
  count: number
  ratings: Record<number, number>
}

interface ChartRatingsProps {
  votes: Vote[]
}

function processVotesData(votes: Vote[]): RatingData[] {
  const groupedByDate = votes.reduce((acc, vote) => {
    const date = new Date(vote.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { ratings: {}, total: 0, count: 0 }
    }
    acc[date].ratings[vote.value] = (acc[date].ratings[vote.value] || 0) + 1
    acc[date].total += vote.value
    acc[date].count += 1
    return acc
  }, {} as Record<string, { ratings: Record<number, number>, total: number, count: number }>)

  return Object.entries(groupedByDate)
    .map(([date, data]) => ({
      date,
      averageRating: data.total / data.count,
      count: data.count,
      ratings: data.ratings
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const chartConfig = {
  averageRating: {
    label: "Note moyenne",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartRatings({ votes }: ChartRatingsProps) {
  const [timeRange, setTimeRange] = React.useState("7d")
  const [isLoading, setIsLoading] = React.useState(true)

  // Simplified mounting logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const chartData = React.useMemo(() => {
    if (!votes?.length) return []
    try {
      return processVotesData(votes)
    } catch (error) {
      console.error('Error processing votes data:', error)
      return []
    }
  }, [votes])

  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []

    try {
      return chartData.filter((item) => {
        const date = new Date(item.date)
        const now = new Date()
        let daysToSubtract = 7
        if (timeRange === "30d") {
          daysToSubtract = 30
        } else if (timeRange === "90d") {
          daysToSubtract = 90
        }
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
      })
    } catch (error) {
      console.error('Error filtering chart data:', error)
      return []
    }
  }, [chartData, timeRange])

  // Loading state
  if (isLoading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Évolution des notes</CardTitle>
            <CardDescription>
              Moyenne des évaluations clients dans le temps
            </CardDescription>
          </div>
          <div className="w-[160px] h-10 bg-muted rounded-lg animate-pulse hidden sm:block" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-muted-foreground">Chargement du graphique...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!filteredData.length) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Évolution des notes</CardTitle>
            <CardDescription>
              Moyenne des évaluations clients dans le temps
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder="7 derniers jours" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 derniers jours
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Dernier mois
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                3 derniers mois
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Aucune donnée disponible</p>
              <p className="text-sm text-muted-foreground">
                pour la période sélectionnée
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Évolution des notes</CardTitle>
          <CardDescription>
            Moyenne des évaluations clients dans le temps
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="7 derniers jours" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              7 derniers jours
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Dernier mois
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              3 derniers mois
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRating" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-averageRating)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-averageRating)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                try {
                  const date = new Date(value)
                  return date.toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                } catch (error) {
                  return value
                }
              }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    try {
                      return new Date(value).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    } catch (error) {
                      return value
                    }
                  }}
                  formatter={(value, _name, item) => {
                    try {
                      const data = item.payload as RatingData
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Note moyenne:</span>
                            <span>{Number(value).toFixed(1)}/5</span>
                          </div>
                          <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = data.ratings[rating] || 0
                              return (
                                <div key={rating} className="flex items-center justify-between gap-2">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className="w-3 h-3"
                                        fill={i < rating ? "#f59e0b" : "none"}
                                        color={i < rating ? "#f59e0b" : "#d1d5db"}
                                        strokeWidth={2}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground pt-1">
                            Total: {data.count} vote{data.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      )
                    } catch (error) {
                      return <div>Erreur d'affichage des données</div>
                    }
                  }}
                />
              }
            />
            <Area
              dataKey="averageRating"
              type="monotone"
              fill="url(#fillRating)"
              stroke="var(--color-averageRating)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}