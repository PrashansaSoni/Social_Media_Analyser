import { useState, useEffect, useCallback } from 'react'
import { graphAPI } from '@/lib/api'
import NetworkGraph from '@/components/Graph/NetworkGraph'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Loader2, 
  Network, 
  Search, 
  TrendingUp,
  Navigation,
  Users,
  RefreshCw,
  Bot,
  Send
} from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const NetworkPage = () => {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [pathResult, setPathResult] = useState(null)
  const [highlightedPath, setHighlightedPath] = useState([])
  const [influencer, setInfluencer] = useState(null)
  const [centralities, setCentralities] = useState([])
  const [loadingPath, setLoadingPath] = useState(false)
  const [geminiQuery, setGeminiQuery] = useState('')
  const [geminiResponse, setGeminiResponse] = useState('')
  const [loadingGemini, setLoadingGemini] = useState(false)

  useEffect(() => {
    fetchGraphData()
    fetchInfluencer()
    fetchCentralities()
  }, [])

  const fetchGraphData = async () => {
    try {
      setLoading(true)
      const response = await graphAPI.getGraphData()
      setGraphData(response.data.graph)
    } catch (error) {
      console.error('Error fetching graph data:', error)
      toast.error('Failed to load network graph')
    } finally {
      setLoading(false)
    }
  }

  const fetchInfluencer = async () => {
    try {
      const response = await graphAPI.getMostInfluential()
      setInfluencer(response.data.influencer)
    } catch (error) {
      console.error('Error fetching influencer:', error)
    }
  }

  const fetchCentralities = async () => {
    try {
      const response = await graphAPI.getDegreeCentrality(10)
      setCentralities(response.data.users)
    } catch (error) {
      console.error('Error fetching centralities:', error)
    }
  }

  // Debounced search function
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await graphAPI.searchUsers(query, 10)
      setSearchResults(response.data.users)
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  const handlePathFind = async (sourceId, targetId) => {
    try {
      setLoadingPath(true)
      const response = await graphAPI.getShortestPath(sourceId, targetId)
      const pathData = response.data.path
      
      setPathResult(pathData)
      
      if (pathData.exists) {
        const pathIds = pathData.users.map(user => user.id)
        setHighlightedPath(pathIds)
        toast.success(`Path found! Distance: ${pathData.distance} connections`)
      } else {
        setHighlightedPath([])
        toast.error('No path exists between these users')
      }
    } catch (error) {
      console.error('Error finding path:', error)
      toast.error('Failed to find path')
    } finally {
      setLoadingPath(false)
    }
  }

  const clearPath = () => {
    setPathResult(null)
    setHighlightedPath([])
  }

  const handleGeminiQuery = async () => {
    if (!geminiQuery.trim()) {
      toast.error('Please enter a question')
      return
    }

    try {
      setLoadingGemini(true)
      const response = await graphAPI.queryGemini(geminiQuery)
      setGeminiResponse(response.data.response)
      toast.success('AI response received!')
    } catch (error) {
      console.error('Error querying Gemini:', error)
      toast.error('Failed to get AI response')
    } finally {
      setLoadingGemini(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading network graph...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Network Graph</h1>
        <p className="text-gray-600">
          Visualize and analyze the social network connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Graph */}
        <div className="lg:col-span-3">
          <Card className="h-[800px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-5 w-5" />
                    <span>Social Network Graph</span>
                  </CardTitle>
                  <CardDescription>
                    Interactive visualization of user connections
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchGraphData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-120px)]">
              <NetworkGraph
                graphData={graphData}
                highlightedPath={highlightedPath}
                onPathFind={handlePathFind}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <span>AI Assistant</span>
              </CardTitle>
              <CardDescription>
                Ask questions about your network data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask about your network..."
                    value={geminiQuery}
                    onChange={(e) => setGeminiQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGeminiQuery()}
                    disabled={loadingGemini}
                  />
                  <Button
                    onClick={handleGeminiQuery}
                    disabled={loadingGemini || !geminiQuery.trim()}
                    size="icon"
                  >
                    {loadingGemini ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {geminiResponse && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Response:</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {geminiResponse}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  <p>Try asking:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>"Who are the most connected users?"</li>
                    <li>"What's the network structure?"</li>
                    <li>"Find users with similar interests"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Path Result */}
          {pathResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4" />
                    <span>Shortest Path</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearPath}>
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPath ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : pathResult.exists ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {pathResult.distance}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        degrees of separation
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Path:</h4>
                      <div className="space-y-2">
                        {pathResult.users.map((user, index) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.fullName}</span>
                            {index < pathResult.users.length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No path exists between the selected users
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Most Influential */}
          {influencer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Most Influential</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={influencer.user.avatar} alt={influencer.user.username} />
                    <AvatarFallback>
                      {getInitials(influencer.user.firstName, influencer.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{influencer.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      @{influencer.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {influencer.connections} connections
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Connected Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Top Connected</span>
              </CardTitle>
              <CardDescription>
                Users with most connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {centralities.slice(0, 5).map((item, index) => (
                  <div key={item.user.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user.avatar} alt={item.user.username} />
                      <AvatarFallback className="text-xs">
                        {getInitials(item.user.firstName, item.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.connections} connections
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NetworkPage
