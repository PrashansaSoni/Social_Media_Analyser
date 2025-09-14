import { useState, useEffect, useCallback } from 'react'
import { usersAPI, friendAPI } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  UserPlus, 
  Check, 
  Clock,
  Verified,
  Users,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const UserSearch = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Debounced search function
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await usersAPI.searchUsers(query, 1, 20)
      setSearchResults(response.data.users)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch])

  // Load friend requests
  const loadFriendRequests = async () => {
    setLoadingRequests(true)
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        usersAPI.getFriendRequests(),
        usersAPI.getSentRequests()
      ])
      setFriendRequests(receivedResponse.data.friendRequests)
      setSentRequests(sentResponse.data.sentRequests)
    } catch (error) {
      console.error('Error loading friend requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    loadFriendRequests()
  }, [])

  const handleFriendRequest = async (userId) => {
    try {
      await friendAPI.sendFriendRequest(userId)
      toast.success('Friend request sent!')
      loadFriendRequests() // Reload to update sent requests
      // Also refresh search results to update follower counts
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleRemoveFriend = async (userId) => {
    try {
      await friendAPI.removeFriend(userId)
      toast.success('Friend removed successfully!')
      loadFriendRequests() // Reload to update sent requests
      // Also refresh search results to update follower counts
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await usersAPI.respondToFriendRequest(requestId, action)
      toast.success(`Friend request ${action}ed!`)
      loadFriendRequests() // Reload to update requests
      // Also refresh search results to update follower counts
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error)
    }
  }

  const handleCancelRequest = async (requestId) => {
    try {
      await usersAPI.cancelFriendRequest(requestId)
      toast.success('Friend request cancelled!')
      loadFriendRequests() // Reload to update sent requests
    } catch (error) {
      console.error('Error cancelling friend request:', error)
    }
  }

  const isRequestSent = (userId) => {
    return sentRequests.some(request => request.following._id === userId)
  }

  const getRequestStatus = (userId) => {
    const sentRequest = sentRequests.find(request => request.following._id === userId)
    return sentRequest ? sentRequest.status : null
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-500" />
            <span>Search Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>

          {/* Search Results */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Search Results</h3>
              {searchResults
                .filter(result => result._id !== user?.id) // Exclude current user
                .map((searchUser) => (
                  <div key={searchUser._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={searchUser.avatar} alt={searchUser.username} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {getInitials(searchUser.firstName, searchUser.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h4 className="font-semibold text-gray-900">
                            {searchUser.firstName} {searchUser.lastName}
                          </h4>
                          {searchUser.isVerified && (
                            <Verified className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">@{searchUser.username}</p>
                        {searchUser.bio && (
                          <p className="text-sm text-gray-600 mt-1">{searchUser.bio}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{searchUser.followersCount} followers</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{searchUser.postsCount} posts</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {isRequestSent(searchUser._id) ? (
                        <div className="flex items-center space-x-2">
                          {getRequestStatus(searchUser._id) === 'pending' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(
                                  sentRequests.find(r => r.following._id === searchUser._id)._id
                                )}
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {getRequestStatus(searchUser._id) === 'accepted' && (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFriend(searchUser._id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Remove Friend
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleFriendRequest(searchUser._id)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {searchQuery && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            <span>Friend Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          ) : friendRequests.length > 0 ? (
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.follower.avatar} alt={request.follower.username} />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                        {getInitials(request.follower.firstName, request.follower.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h4 className="font-semibold text-gray-900">
                          {request.follower.firstName} {request.follower.lastName}
                        </h4>
                        {request.follower.isVerified && (
                          <Verified className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{request.follower.username}</p>
                      {request.follower.bio && (
                        <p className="text-sm text-gray-600 mt-1">{request.follower.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRespondToRequest(request._id, 'reject')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRespondToRequest(request._id, 'accept')}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No pending friend requests</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserSearch
