import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, maxRating = 5, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const starNumber = i + 1
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100
        
        return (
          <div key={i} className="relative">
            <Star
              className={sizeClasses[size]}
              fill="none"
              color="#d1d5db"
              strokeWidth={2}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={sizeClasses[size]}
                fill="#f59e0b"
                color="#f59e0b"
                strokeWidth={2}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}