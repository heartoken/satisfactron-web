import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Star, TrendingUp, Vote } from "lucide-react"

interface DevicePageProps {
  params: {
    deviceId: string
  }
}

async function getDeviceStats(deviceId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/votes?deviceId=${deviceId}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    return null
  }
  
  return response.json()
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { deviceId } = params
  const stats = await getDeviceStats(deviceId)

  if (!stats) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getVoteColor = (value: number) => {
    if (value >= 4) return "bg-green-500"
    if (value >= 3) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{stats.name}</h1>
            <p className="text-muted-foreground">Detailed voting statistics and history</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Vote className="w-4 h-4 mr-2" />
            {stats.votes.length} total votes
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.votes.length > 0 
                ? Math.round((stats.votes.reduce((sum, vote) => sum + vote.value, 0) / stats.votes.length) * 100) / 100
                : 0}
            </div>
            <p className="text-sm text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.votes.length}</div>
            <p className="text-sm text-muted-foreground">votes collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-green-500" />
              Latest Vote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.votes[0]?.value || "N/A"}</div>
            <p className="text-sm text-muted-foreground">
              {stats.votes[0] ? "Recent vote" : "No votes yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vote History */}
      <Card>
        <CardHeader>
          <CardTitle>Vote History</CardTitle>
          <CardDescription>Complete history of all votes for this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.votes.map((vote) => (
              <div key={vote.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full ${getVoteColor(vote.value)} flex items-center justify-center text-white font-bold`}
                  >
                    {vote.value}
                  </div>
                  <div>
                    <p className="font-medium">Vote: {vote.value}/5</p>
                    <p className="text-sm text-muted-foreground">Vote ID: {vote.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <Badge variant="outline">{vote.id.slice(0, 8)}...</Badge>
              </div>
            ))}
          </div>

          {stats.votes.length === 0 && (
            <div className="text-center py-8">
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No votes recorded</h3>
              <p className="text-muted-foreground">This device hasn't received any votes yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
