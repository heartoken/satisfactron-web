"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { TrendingUp, TrendingDown, Minus, Clock, Calendar } from "lucide-react"

type Vote = {
    id: string
    value: number
    created_at: string
}

type MealPeriod = {
    id: string
    name: string
    start_time: string
    end_time: string
    is_active: boolean
}

type DailyVsAllTimeProps = {
    votes: Vote[]
    mealPeriods: MealPeriod[]
}

function getMealPeriodForVote(vote: Vote, mealPeriods: MealPeriod[]): MealPeriod | null {
    try {
        // Extract UTC time for comparison
        const voteDate = new Date(vote.created_at);
        const voteMinutes = voteDate.getUTCHours() * 60 + voteDate.getUTCMinutes();

        return mealPeriods.find(meal => {
            if (!meal.is_active) return false;

            const [startHour, startMin] = meal.start_time.split(':').map(Number);
            const [endHour, endMin] = meal.end_time.split(':').map(Number);

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            // Handle normal time range (e.g., 08:00 to 12:00)
            if (startMinutes <= endMinutes) {
                return voteMinutes >= startMinutes && voteMinutes <= endMinutes;
            }
            // Handle midnight crossover (e.g., 22:00 to 02:00)
            else {
                return voteMinutes >= startMinutes || voteMinutes <= endMinutes;
            }
        }) || null;
    } catch (error) {
        console.error('Error getting meal period for vote:', error);
        return null;
    }
}

function getTodaysVotes(votes: Vote[]): Vote[] {
    try {
        const today = new Date().toDateString();
        return votes.filter(vote => {
            try {
                return new Date(vote.created_at).toDateString() === today;
            } catch (error) {
                console.error('Error parsing vote date:', error);
                return false;
            }
        });
    } catch (error) {
        console.error('Error getting today\'s votes:', error);
        return [];
    }
}

function calculateMealComparison(votes: Vote[], mealPeriods: MealPeriod[]) {
    try {
        const todaysVotes = getTodaysVotes(votes);

        return mealPeriods.map(meal => {
            try {
                // All-time stats for this meal
                const allTimeVotesForMeal = votes.filter(vote => {
                    const voteMeal = getMealPeriodForVote(vote, mealPeriods);
                    return voteMeal?.id === meal.id;
                });

                // Today's stats for this meal
                const todaysVotesForMeal = todaysVotes.filter(vote => {
                    const voteMeal = getMealPeriodForVote(vote, mealPeriods);
                    return voteMeal?.id === meal.id;
                });

                const allTimeAverage = allTimeVotesForMeal.length > 0
                    ? allTimeVotesForMeal.reduce((sum, vote) => sum + vote.value, 0) / allTimeVotesForMeal.length
                    : 0;

                const todaysAverage = todaysVotesForMeal.length > 0
                    ? todaysVotesForMeal.reduce((sum, vote) => sum + vote.value, 0) / todaysVotesForMeal.length
                    : 0;

                const difference = todaysAverage - allTimeAverage;
                const percentageChange = allTimeAverage > 0 ? ((difference / allTimeAverage) * 100) : 0;

                return {
                    meal,
                    allTime: {
                        average: Math.round(allTimeAverage * 100) / 100,
                        count: allTimeVotesForMeal.length
                    },
                    today: {
                        average: Math.round(todaysAverage * 100) / 100,
                        count: todaysVotesForMeal.length
                    },
                    difference: Math.round(difference * 100) / 100,
                    percentageChange: Math.round(percentageChange * 10) / 10,
                    trend: difference > 0.1 ? 'up' : difference < -0.1 ? 'down' : 'stable'
                };
            } catch (error) {
                console.error('Error calculating meal comparison:', error);
                return {
                    meal,
                    allTime: { average: 0, count: 0 },
                    today: { average: 0, count: 0 },
                    difference: 0,
                    percentageChange: 0,
                    trend: 'stable' as const
                };
            }
        });
    } catch (error) {
        console.error('Error in calculateMealComparison:', error);
        return [];
    }
}

export function DailyVsAllTimeStats({ votes, mealPeriods }: DailyVsAllTimeProps) {
    const [isMounted, setIsMounted] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const isMountedRef = React.useRef(false)

    // Track mount state
    React.useEffect(() => {
        isMountedRef.current = true
        setIsMounted(true)

        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }, 50)

        return () => {
            isMountedRef.current = false
            setIsMounted(false)
            clearTimeout(timer)
        }
    }, [])

    // Memoize comparisons to prevent unnecessary recalculations
    const comparisons = React.useMemo(() => {
        if (!isMounted || !votes?.length || !mealPeriods?.length) return []
        return calculateMealComparison(votes, mealPeriods)
    }, [votes, mealPeriods, isMounted])

    // Memoize today's date to prevent unnecessary re-renders
    const todaysDate = React.useMemo(() => {
        try {
            return new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (error) {
            console.error('Error formatting date:', error)
            return new Date().toDateString()
        }
    }, [])

    // Don't render if meal periods are not available
    if (!mealPeriods?.length) {
        return null
    }

    // Loading state
    if (!isMounted || isLoading) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <div className="space-y-2">
                        <div className="h-6 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: Math.min(mealPeriods.length, 3) }).map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg space-y-3">
                                <div className="h-4 bg-muted rounded animate-pulse" />
                                <div className="h-8 bg-muted rounded animate-pulse" />
                                <div className="h-8 bg-muted rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Aujourd'hui vs Historique
                </CardTitle>
                <CardDescription>
                    Comparaison des performances par repas - {todaysDate}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {comparisons.map(({ meal, allTime, today, difference, percentageChange, trend }) => (
                        <div key={meal.id} className="p-4 border rounded-lg space-y-3">
                            {/* Meal Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">{meal.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {meal.start_time} - {meal.end_time}
                                    </p>
                                </div>
                                {today.count > 0 && (
                                    <Badge variant={
                                        trend === 'up' ? 'default' :
                                            trend === 'down' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                        {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                                        {trend === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                                        {difference > 0 ? '+' : ''}{difference}
                                    </Badge>
                                )}
                            </div>

                            {/* Today's Stats */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-600">Aujourd'hui</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{today.count} avis</span>
                                </div>

                                {today.count > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl font-bold text-blue-600">{today.average}</span>
                                        <span className="text-sm text-muted-foreground">/ 5</span>
                                        <StarRating rating={today.average} size="lg" />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun avis aujourd'hui</p>
                                )}
                            </div>

                            {/* All-Time Stats */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-600">Historique</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{allTime.count} avis</span>
                                </div>

                                {allTime.count > 0 ? (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl font-bold text-gray-600">{allTime.average}</span>
                                        <span className="text-sm text-muted-foreground">/ 5</span>
                                        <StarRating rating={allTime.average} size="lg" />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun historique</p>
                                )}
                            </div>

                            {/* Performance Indicator */}
                            {today.count > 0 && allTime.count > 0 && (
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Performance</span>
                                        <span className={`font-medium ${trend === 'up' ? 'text-green-600' :
                                            trend === 'down' ? 'text-red-600' :
                                                'text-gray-600'
                                            }`}>
                                            {percentageChange > 0 ? '+' : ''}{percentageChange}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Overall Today Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Résumé du jour</h4>
                            <p className="text-sm text-muted-foreground">
                                {comparisons.reduce((sum, c) => sum + c.today.count, 0)} avis reçus aujourd'hui
                            </p>
                        </div>
                        <div className="text-right">
                            {(() => {
                                const improvingMeals = comparisons.filter(c => c.trend === 'up').length;
                                const decliningMeals = comparisons.filter(c => c.trend === 'down').length;

                                return (
                                    <div className="space-y-1">
                                        {improvingMeals > 0 && (
                                            <div className="flex items-center text-sm text-green-600">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                {improvingMeals} repas en amélioration
                                            </div>
                                        )}
                                        {decliningMeals > 0 && (
                                            <div className="flex items-center text-sm text-red-600">
                                                <TrendingDown className="w-4 h-4 mr-1" />
                                                {decliningMeals} repas en baisse
                                            </div>
                                        )}
                                        {improvingMeals === 0 && decliningMeals === 0 && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Minus className="w-4 h-4 mr-1" />
                                                Performance stable
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}