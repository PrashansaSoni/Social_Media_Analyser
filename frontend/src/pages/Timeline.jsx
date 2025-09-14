import { useState, useEffect, useCallback } from 'react'
import { postsAPI } from '@/lib/api'
import Post from '@/components/Post/Post'
import Compose from '@/components/Post/Compose'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Home } from 'lucide-react'
import toast from 'react-hot-toast'

const Timeline = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await postsAPI.getFeed(pageNum, 20)
      const newPosts = response.data.posts
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      setHasMore(response.data.pagination.hasMore)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    }
  }, [])

  const loadInitialPosts = async () => {
    setLoading(true)
    await fetchPosts(1, false)
    setLoading(false)
  }

  const refreshPosts = async () => {
    setRefreshing(true)
    setPage(1)
    await fetchPosts(1, false)
    setRefreshing(false)
  }

  const loadMorePosts = async () => {
    if (!hasMore || loading) return
    
    const nextPage = page + 1
    setPage(nextPage)
    await fetchPosts(nextPage, true)
  }

  const handlePostCreated = () => {
    refreshPosts()
  }

  const handlePostUpdate = () => {
    // Refresh the specific post or the entire feed
    refreshPosts()
  }

  useEffect(() => {
    loadInitialPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading your timeline</h3>
          <p className="text-gray-600">Getting the latest posts...</p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 -mx-4 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Home
                  </h1>
                  <p className="text-sm text-gray-500">Your personalized timeline</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPosts}
                disabled={refreshing}
                className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Compose */}
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <Compose onPostCreated={handlePostCreated} />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Welcome to your timeline!</h3>
                  <p className="text-gray-600 mb-6">
                    Follow some users or create your first post to see content here!
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              posts.map((post, index) => (
                <div 
                  key={post._id}
                  className="transform transition-all duration-300 hover:scale-[1.01]"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <Post
                    post={post}
                    onUpdate={handlePostUpdate}
                  />
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {hasMore && posts.length > 0 && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={loadMorePosts}
                disabled={loading}
                className="bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Timeline
