import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Star, TrendingUp, Vote } from "lucide-react"
import { DeleteDeviceButton } from "@/components/delete-device-button"
import { DeleteAllVotesButton } from "@/components/delete-all-votes-button"
import { DeleteVoteButton } from "@/components/delete-vote-button"
import { CopyButton } from "@/components/copy-button"
import { StarRating } from "@/components/star-rating"
import { DevicePageClient } from "@/components/device-page-client"
import { DynamicTimeAgo } from "@/components/dynamic-time-ago"
import { ChartRatings } from "@/components/chart-ratings"

interface DevicePageProps {
  params: Promise<{
    deviceId: string
  }>
}

import { createClient } from 'gel'

type Device = {
  id: string
  name: string
  votes: Vote[]
}

type Vote = {
  id: string
  value: number
  created_at: string
  device: Device
}

const client = createClient()

async function getDeviceStats(deviceId: string): Promise<Device | null> {
  try {
    const result = await client.query(`
      select Device {
        id,
        name,
        votes: {
          id,
          value,
          created_at,
          device: { id, name }
        }
      } filter .id = <uuid>$deviceId;
    `, { deviceId })

    return (result as Device[])[0] || null
  } catch (error) {
    console.error('Failed to fetch device:', error)
    return null
  }
}

// Disable caching for this page
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function DevicePage({ params }: DevicePageProps) {
  const { deviceId } = await params
  const stats = await getDeviceStats(deviceId)

  if (!stats) {
    notFound()
  }


  return (
    <DevicePageClient pollingInterval={1000}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{stats.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">ID: {stats.id.slice(0, 8)}...</p>
                <CopyButton textToCopy={stats.id} />
              </div>
            </div>
            <div className="flex gap-2">
              <DeleteAllVotesButton 
                deviceId={stats.id} 
                deviceName={stats.name} 
                voteCount={stats.votes.length} 
              />
              <DeleteDeviceButton 
                deviceId={stats.id} 
                deviceName={stats.name} 
                voteCount={stats.votes.length} 
                redirectAfterDelete={true}
              />
            </div>
          </div>
        </div>


      {/* Rating Chart */}
      <div className="mb-8">
        <ChartRatings votes={stats.votes} />
      </div>

      {/* Vote Summary */}
      <Card className="w-full mb-8 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <StarRating 
            rating={stats.votes.length > 0 
              ? stats.votes.reduce((sum: number, vote: Vote) => sum + vote.value, 0) / stats.votes.length
              : 0} 
            size="md" 
          />
          <span className="text-lg font-semibold text-foreground">
            {stats.votes.length > 0 
              ? (stats.votes.reduce((sum: number, vote: Vote) => sum + vote.value, 0) / stats.votes.length).toFixed(1)
              : '0.0'} sur 5
          </span>
        </div>
        <CardHeader>
          <CardTitle>Avis des clients</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Basé sur {stats.votes.length} évaluation{stats.votes.length !== 1 ? 's' : ''} clients
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.votes.filter(vote => vote.value === rating).length
              const percentage = stats.votes.length > 0 ? (count / stats.votes.length) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-4 text-sm">
                  <div className="flex shrink-0 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4" 
                        fill={i < rating ? "#f59e0b" : "none"}
                        color={i < rating ? "#f59e0b" : "#d1d5db"}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                  <Progress value={percentage} className="h-2 flex-grow" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">
                      ({count})
                    </span>
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Vote History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des votes</CardTitle>
          <CardDescription>Historique complet de tous les votes pour cet appareil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.votes
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((vote: Vote) => (
              <div key={vote.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <StarRating rating={vote.value} size="md" />
                  <div>
                    <p className="text-sm text-muted-foreground"><DynamicTimeAgo dateString={vote.created_at} /></p>
                  </div>
                </div>
                <DeleteVoteButton voteId={vote.id} />
              </div>
            ))}
          </div>

          {stats.votes.length === 0 && (
            <div className="text-center py-8">
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun vote enregistré</h3>
              <p className="text-muted-foreground">Cet appareil n'a pas encore reçu de votes.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DevicePageClient>
  )
}
