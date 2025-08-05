'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DevicePageClientProps {
  children: React.ReactNode
  pollingInterval?: number
}

export function DevicePageClient({ children, pollingInterval = 5000 }: DevicePageClientProps) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [router, pollingInterval])

  return <>{children}</>
}