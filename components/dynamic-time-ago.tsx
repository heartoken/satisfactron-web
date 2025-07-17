'use client'

import { useEffect, useState } from 'react'
import { timeAgoInFrench } from '@/lib/time-ago'

interface DynamicTimeAgoProps {
  dateString: string
}

export function DynamicTimeAgo({ dateString }: DynamicTimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState(() => timeAgoInFrench(dateString))

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(timeAgoInFrench(dateString))
    }

    const getUpdateInterval = () => {
      const date = new Date(dateString)
      const now = new Date()
      const ageInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (ageInSeconds < 60) {
        return 1000 // Update every second for the first minute
      } else if (ageInSeconds < 3600) {
        return 60000 // Update every minute for the first hour
      } else if (ageInSeconds < 86400) {
        return 3600000 // Update every hour for the first day
      } else {
        return 86400000 // Update once a day after that
      }
    }

    const scheduleNextUpdate = () => {
      const interval = getUpdateInterval()
      return setTimeout(() => {
        updateTimeAgo()
        scheduleNextUpdate()
      }, interval)
    }

    const timeoutId = scheduleNextUpdate()

    return () => clearTimeout(timeoutId)
  }, [dateString])

  return <span>{timeAgo}</span>
}