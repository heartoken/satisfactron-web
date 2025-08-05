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

interface DeleteAllVotesButtonProps {
  deviceId: string
  deviceName: string
  voteCount: number
}

export function DeleteAllVotesButton({ deviceId, deviceName, voteCount }: DeleteAllVotesButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDeleteAllVotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/votes?deviceId=${deviceId}&deleteAllVotes=true`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Failed to delete all votes')
      }
    } catch (error) {
      console.error('Error deleting all votes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (voteCount === 0) {
    return null
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer tous les votes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer tous les votes</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer tous les {voteCount} votes de "{deviceName}" ? Cette action ne peut pas être annulée. L'appareil sera conservé mais tous ses votes seront définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAllVotes}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Suppression...' : 'Supprimer tous les votes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}