"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { StarRating } from "@/components/star-rating"

type Vote = {
    id: string
    value: number
    created_at: string
}

interface RatingsSummaryProps {
    votes: Vote[]
}

export function RatingsSummary({ votes }: RatingsSummaryProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Calculate stats
    const averageRating = votes.length > 0
        ? votes.reduce((sum, vote) => sum + vote.value, 0) / votes.length
        : 0

    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: votes.filter(vote => vote.value === rating).length,
        percentage: votes.length > 0
            ? (votes.filter(vote => vote.value === rating).length / votes.length) * 100
            : 0
    }))

    // Show loading state during hydration
    if (!isClient) {
        return (
            <Card className="w-full relative">
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <div className="w-24 h-6 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
                <CardHeader>
                    <CardTitle>Avis des clients</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Chargement des évaluations...
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-4 text-sm">
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
                            <div className="h-2 flex-grow bg-muted rounded-full animate-pulse" />
                            <div className="w-16 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full relative">
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <StarRating rating={averageRating} size="md" />
                <span className="text-lg font-semibold text-foreground">
                    {averageRating.toFixed(1)} sur 5
                </span>
            </div>
            <CardHeader>
                <CardTitle>Avis des clients</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Basé sur {votes.length} évaluation{votes.length !== 1 ? "s" : ""} clients
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {ratingCounts.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-4 text-sm">
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
                ))}
            </CardContent>
        </Card>
    )
}