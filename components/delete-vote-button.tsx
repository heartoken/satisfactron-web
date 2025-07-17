'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'

interface DeleteVoteButtonProps {
  voteId: string
}

export function DeleteVoteButton({ voteId }: DeleteVoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/votes?voteId=${voteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Failed to delete vote')
      }
    } catch (error) {
      console.error('Error deleting vote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4 mr-1" />
      {isLoading ? 'Suppression...' : 'Supprimer'}
    </Button>
  )
}