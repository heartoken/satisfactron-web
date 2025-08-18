"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Vote, Utensils } from "lucide-react"
import { StarRating } from "@/components/star-rating"

interface MealsTabContentProps {
    mealPeriods: any[]
    mealStats: any[]
}

export function MealsTabContent({ mealPeriods, mealStats }: MealsTabContentProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="relative">
                        <CardHeader className="pb-3">
                            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-32 bg-muted rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (mealPeriods.length === 0) {
        return (
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
        )
    }

    return (
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
                                        <StarRating rating={meal.averageRating} size="sm" />
                                    </div>
                                </div>

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
    )
}