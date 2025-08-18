"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Suspense } from "react"
interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, maxRating = 5, size = "md" }: StarRatingProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const isMountedRef = React.useRef(false)

  // Track mount state
  React.useEffect(() => {
    isMountedRef.current = true
    setIsMounted(true)

    return () => {
      isMountedRef.current = false
      setIsMounted(false)
    }
  }, [])

  // Memoize size classes to prevent unnecessary re-renders
  const sizeClasses = React.useMemo(() => ({
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }), [])

  // Validate and sanitize props
  const sanitizedRating = React.useMemo(() => {
    if (typeof rating !== 'number' || isNaN(rating)) return 0
    return Math.max(0, Math.min(rating, maxRating))
  }, [rating, maxRating])

  const sanitizedMaxRating = React.useMemo(() => {
    if (typeof maxRating !== 'number' || isNaN(maxRating) || maxRating <= 0) return 5
    return Math.max(1, Math.min(maxRating, 10)) // Cap at 10 stars max
  }, [maxRating])

  // Generate stars array with memoization
  const stars = React.useMemo(() => {
    if (!isMounted) return []

    try {
      return Array.from({ length: sanitizedMaxRating }, (_, i) => {
        const starNumber = i + 1
        const fillPercentage = Math.min(Math.max(sanitizedRating - i, 0), 1) * 100

        return {
          id: i,
          starNumber,
          fillPercentage: Math.round(fillPercentage * 100) / 100 // Round to avoid floating point issues
        }
      })
    } catch (error) {
      console.error('Error generating stars:', error)
      return []
    }
  }, [sanitizedRating, sanitizedMaxRating, isMounted])

  if (!isMounted) {
    return (
      <Suspense fallback="loading...">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: sanitizedMaxRating }).map((_, i) => (
            <div key={i} className={`${sizeClasses[size]} bg-muted rounded animate-pulse`} />
          ))}
        </div>
      </Suspense>

    )
  }

  // Handle edge cases
  if (stars.length === 0) {
    return (
      <Suspense fallback="loading...">
        <div className="flex items-center gap-0.5">
          <span className="text-xs text-muted-foreground">Invalid rating</span>
        </div>
      </Suspense>

    )
  }

  return (
    <Suspense fallback="loading...">
      <div className="flex items-center gap-0.5" role="img" aria-label={`${sanitizedRating} out of ${sanitizedMaxRating} stars`}>
        {stars.map(({ id, fillPercentage }) => (
          <div key={id} className="relative flex-shrink-0">
            {/* Background star */}
            <Star
              className={sizeClasses[size]}
              fill="none"
              color="#d1d5db"
              strokeWidth={2}
              aria-hidden="true"
            />

            {/* Filled star overlay */}
            {fillPercentage > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: `${fillPercentage}%`,
                  // Prevent layout shift during animations
                  minWidth: fillPercentage > 0 ? '1px' : '0'
                }}
              >
                <Star
                  className={sizeClasses[size]}
                  fill="#f59e0b"
                  color="#f59e0b"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        ))}

        {/* Screen reader text */}
        <span className="sr-only">
          Rating: {sanitizedRating} out of {sanitizedMaxRating} stars
        </span>
      </div>
    </Suspense>

  )
}

// Export a memoized version to prevent unnecessary re-renders
export default React.memo(StarRating)