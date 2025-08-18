'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface DevicePageClientProps {
  children: React.ReactNode
  pollingInterval?: number
}

export function DevicePageClient({ children, pollingInterval = 5000 }: DevicePageClientProps) {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      // Prevent overlapping refreshes
      if (!isRefreshingRef.current) {
        isRefreshingRef.current = true

        // Use requestIdleCallback if available for better performance
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            router.refresh()
            // Reset flag after a delay to prevent rapid refreshes
            setTimeout(() => {
              isRefreshingRef.current = false
            }, 1000)
          })
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            router.refresh()
            setTimeout(() => {
              isRefreshingRef.current = false
            }, 1000)
          }, 0)
        }
      }
    }, pollingInterval)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isRefreshingRef.current = false
    }
  }, [router, pollingInterval])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return <>{children}</>
}