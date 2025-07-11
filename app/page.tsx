import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Vote } from "lucide-react"

async function getDevicesStats() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
    
  const response = await fetch(`${baseUrl}/api/votes`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch devices')
  }
  
  return response.json()
}

export default async function Dashboard() {
  const devicesStats = await getDevicesStats()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voting Dashboard</h1>
        <p className="text-muted-foreground">Monitor voting activity across all devices</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devicesStats.map((device) => {
          const totalVotes = device.votes.length;
          const averageVote = totalVotes > 0 
            ? Math.round((device.votes.reduce((sum, vote) => sum + vote.value, 0) / totalVotes) * 100) / 100
            : 0;
          
          return (
            <Link key={device.name} href={`/device/${device.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <Badge variant="secondary">
                      <Vote className="w-3 h-3 mr-1" />
                      {totalVotes}
                    </Badge>
                  </div>
                  <CardDescription>Click to view detailed statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{averageVote}</span>
                      <span className="text-sm text-muted-foreground">avg</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>{totalVotes} votes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {devicesStats.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
              <p className="text-muted-foreground">Start collecting votes to see device statistics here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
