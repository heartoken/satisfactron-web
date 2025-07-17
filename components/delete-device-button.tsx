'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'

interface DeleteDeviceButtonProps {
  deviceId: string
  deviceName: string
  voteCount: number
  redirectAfterDelete?: boolean
}

export function DeleteDeviceButton({ deviceId, deviceName, voteCount, redirectAfterDelete = false }: DeleteDeviceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/votes?deviceId=${deviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (redirectAfterDelete) {
          router.push('/')
        } else {
          router.refresh()
        }
      } else {
        console.error('Failed to delete device')
      }
    } catch (error) {
      console.error('Error deleting device:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Device</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{deviceName}"? This will permanently delete the device and all {voteCount} votes associated with it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete Device'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}