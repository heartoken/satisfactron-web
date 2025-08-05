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
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer l'appareil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'appareil</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{deviceName}" ? Cela supprimera définitivement l'appareil et les {voteCount} votes qui lui sont associés. Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Suppression...' : 'Supprimer l\'appareil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}