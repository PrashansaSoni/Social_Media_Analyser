import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usersAPI, friendsAPI, graphAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Network,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { getInitials, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [
        statsRes,
        friendsRes,
        pendingRes,
        sentRes,
        suggestionsRes,
        influencerRes
      ] = await Promise.all([
        graphAPI.getNetworkStats(),
        friendsAPI.getUserFriends(user.id),
        friendsAPI.getPendingRequests(),
        friendsAPI.getSentRequests(),
        graphAPI.getFriendSuggestions(user.id, 5),
        graphAPI.getMostInfluential()
      ])

      setStats(statsRes.data.stats)
      setFriends(friendsRes.data.friends || [])
      setPendingRequests(pendingRes.data.requests || [])
      setSentRequests(sentRes.data.requests || [])
      setSuggestions(suggestionsRes.data.suggestions)
      setInfluencer(influencerRes.data.influencer)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleFriendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId)
      toast.success('Friend request sent!')
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleRequestResponse = async (friendshipId, action) => {
    try {
      await friendsAPI.respondToRequest(friendshipId, action)
      toast.success(`Friend request ${action}ed!`)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your social network
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friends.length}</div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Size</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total users in network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Influential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {influencer?.user?.firstName} {influencer?.user?.lastName}
            </div>
            <p className="text-xs text-muted-foreground">
              {influencer?.connections || 0} connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Friends and Requests */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                  <CardDescription>
                    People you're connected with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {friends.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No friends yet</p>
                      <p className="text-sm text-muted-foreground">
                        Start by sending friend requests!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={friend.avatar} alt={friend.username} />
                              <AvatarFallback>
                                {getInitials(friend.firstName, friend.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friend.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                @{friend.username}
                              </p>
                              {friend.bio && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {friend.bio}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Friends since {formatDateTime(friend.friendsSince)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>
                    Friend requests waiting for your response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage 
                                src={request.requester.avatar} 
                                alt={request.requester.username} 
                              />
                              <AvatarFallback>
                                {getInitials(
                                  request.requester.firstName, 
                                  request.requester.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.requester.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                @{request.requester.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Sent {formatDateTime(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestResponse(request.id, 'accept')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestResponse(request.id, 'decline')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Requests</CardTitle>
                  <CardDescription>
                    Friend requests you've sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No sent requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage 
                                src={request.recipient.avatar} 
                                alt={request.recipient.username} 
                              />
                              <AvatarFallback>
                                {getInitials(
                                  request.recipient.firstName, 
                                  request.recipient.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.recipient.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                @{request.recipient.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Sent {formatDateTime(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pending
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Friend Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Friends</CardTitle>
              <CardDescription>
                People you might know
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No suggestions available
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.user._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={suggestion.user.avatar} 
                            alt={suggestion.user.username} 
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              suggestion.user.firstName, 
                              suggestion.user.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {suggestion.user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.mutualFriends} mutual friends
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFriendRequest(suggestion.user.id)}
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Network Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-sm font-medium">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Connections</span>
                <span className="text-sm font-medium">{stats?.totalFriendships || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Connections</span>
                <span className="text-sm font-medium">{stats?.averageDegree || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Connected Components</span>
                <span className="text-sm font-medium">{stats?.connectedComponents || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
