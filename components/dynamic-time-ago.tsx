'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { timeAgoInFrench } from '@/lib/time-ago'

interface DynamicTimeAgoProps {
  dateString: string
}

export function DynamicTimeAgo({ dateString }: DynamicTimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isMountedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Validate and parse date
  const parsedDate = useMemo(() => {
    try {
      if (!dateString) return null
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      return date
    } catch (error) {
      console.error('Error parsing date:', error)
      return null
    }
  }, [dateString])

  // Initialize time ago safely
  const initialTimeAgo = useMemo(() => {
    if (!parsedDate) return 'Date invalide'
    try {
      return timeAgoInFrench(dateString)
    } catch (error) {
      console.error('Error getting initial time ago:', error)
      return 'Erreur de date'
    }
  }, [dateString, parsedDate])

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true
    setIsMounted(true)

    if (parsedDate) {
      setTimeAgo(initialTimeAgo)
      setHasError(false)
    } else {
      setHasError(true)
    }

    return () => {
      isMountedRef.current = false
      setIsMounted(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [parsedDate, initialTimeAgo])

  // Safe update function
  const updateTimeAgo = useMemo(() => {
    return () => {
      if (!isMountedRef.current || !parsedDate) return

      try {
        const newTimeAgo = timeAgoInFrench(dateString)
        if (isMountedRef.current) {
          setTimeAgo(newTimeAgo)
          lastUpdateRef.current = Date.now()
        }
      } catch (error) {
        console.error('Error updating time ago:', error)
        if (isMountedRef.current) {
          setHasError(true)
        }
      }
    }
  }, [dateString, parsedDate])

  // Calculate update interval
  const getUpdateInterval = useMemo(() => {
    return () => {
      if (!parsedDate) return 86400000 // 1 day fallback

      try {
        const now = new Date()
        const ageInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000)

        if (ageInSeconds < 0) {
          // Future date - update every minute
          return 60000
        } else if (ageInSeconds < 60) {
          // Less than 1 minute - update every 5 seconds (reduced frequency)
          return 5000
        } else if (ageInSeconds < 3600) {
          // Less than 1 hour - update every minute
          return 60000
        } else if (ageInSeconds < 86400) {
          // Less than 1 day - update every hour
          return 3600000
        } else if (ageInSeconds < 604800) {
          // Less than 1 week - update every 6 hours
          return 21600000
        } else {
          // Older than 1 week - update once a day
          return 86400000
        }
      } catch (error) {
        console.error('Error calculating update interval:', error)
        return 86400000 // 1 day fallback
      }
    }
  }, [parsedDate])

  // Schedule updates
  useEffect(() => {
    if (!isMounted || !parsedDate || hasError) return

    const scheduleNextUpdate = () => {
      if (!isMountedRef.current) return

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      try {
        const interval = getUpdateInterval()

        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            updateTimeAgo()
            scheduleNextUpdate() // Schedule next update
          }
        }, interval)
      } catch (error) {
        console.error('Error scheduling update:', error)
      }
    }

    // Initial update and schedule
    updateTimeAgo()
    scheduleNextUpdate()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isMounted, parsedDate, hasError, updateTimeAgo, getUpdateInterval])

  // Handle visibility change to pause/resume updates
  useEffect(() => {
    if (!isMounted) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clear timeout to save resources
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      } else {
        // Page is visible again, update immediately and reschedule
        if (isMountedRef.current && parsedDate && !hasError) {
          updateTimeAgo()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isMounted, parsedDate, hasError, updateTimeAgo])

  // Loading state
  if (!isMounted) {
    return <span className="inline-block w-16 h-4 bg-muted rounded animate-pulse" />
  }

  // Error state
  if (hasError || !parsedDate) {
    return (
      <span className="text-muted-foreground text-sm" title={`Invalid date: ${dateString}`}>
        Date invalide
      </span>
    )
  }

  // Success state
  return (
    <span
      title={parsedDate.toLocaleString('fr-FR')}
      className="transition-opacity duration-200"
    >
      {timeAgo}
    </span>
  )
}

// Export memoized version to prevent unnecessary re-renders
export default DynamicTimeAgo