import { useState } from 'react'
import { postsAPI, friendAPI } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  MoreHorizontal,
  Verified,
  Calendar
} from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const Post = ({ post, onUpdate, showActions = true }) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.isLikedBy?.(user?.id) || false)
  const [isRetweeted, setIsRetweeted] = useState(post.isRetweetedBy?.(user?.id) || false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [retweetCount, setRetweetCount] = useState(post.retweetCount || 0)
  const [commentCount, setCommentCount] = useState(post.commentCount || 0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    
    try {
      const response = await postsAPI.likePost(post._id)
      setIsLiked(response.data.isLiked)
      setLikeCount(response.data.likeCount)
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetweet = async () => {
    if (loading) return
    setLoading(true)
    
    try {
      const response = await postsAPI.retweetPost(post._id)
      setIsRetweeted(response.data.isRetweeted)
      setRetweetCount(response.data.retweetCount)
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error toggling retweet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (loading) return
    setLoading(true)
    
    try {
      if (isFollowing) {
        await friendAPI.removeFriend(post.author._id)
        setIsFollowing(false)
        toast.success('Unfollowed successfully')
      } else {
        await friendAPI.sendFriendRequest(post.author._id)
        setIsFollowing(true)
        toast.success('Following successfully')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content) => {
    // Convert hashtags to clickable links
    let formatted = content.replace(/#[\w\u0590-\u05ff]+/g, '<span class="text-blue-500 hover:underline cursor-pointer">$&</span>')
    
    // Convert mentions to clickable links
    formatted = formatted.replace(/@[\w\u0590-\u05ff]+/g, '<span class="text-blue-500 hover:underline cursor-pointer">$&</span>')
    
    return formatted
  }

  const renderPost = (postData) => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md group-hover:ring-blue-200 transition-all duration-300">
              <AvatarImage src={postData.author.avatar} alt={postData.author.username} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(postData.author.firstName, postData.author.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <h3 className="font-bold text-gray-900 truncate text-lg">
                    {postData.author.firstName} {postData.author.lastName}
                  </h3>
                  {postData.author.isVerified && (
                    <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <span className="text-gray-500 text-sm">@{postData.author.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {formatDate(postData.createdAt)}
                </span>
              </div>
              
              {showActions && postData.author._id !== user?.id && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFollow}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p 
                className="text-gray-900 whitespace-pre-wrap text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(postData.content) }}
              />
              
              {/* Media */}
              {postData.media && postData.media.length > 0 && (
                <div className="mt-4">
                  {postData.media.map((media, index) => (
                    <div key={index} className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                      {media.type === 'image' && (
                        <img 
                          src={media.url} 
                          alt={media.alt || 'Post media'} 
                          className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {media.type === 'video' && (
                        <video 
                          src={media.url} 
                          controls 
                          className="w-full h-auto max-h-96"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center justify-between max-w-md pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-2 transition-all duration-200"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{commentCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetweet}
                  disabled={loading}
                  className={`flex items-center space-x-2 rounded-full px-3 py-2 transition-all duration-200 ${
                    isRetweeted 
                      ? 'text-green-500 hover:text-green-600 hover:bg-green-50' 
                      : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                  }`}
                >
                  <Repeat2 className="h-5 w-5" />
                  <span className="font-medium">{retweetCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={loading}
                  className={`flex items-center space-x-2 rounded-full px-3 py-2 transition-all duration-200 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
                  <span className="font-medium">{likeCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-2 transition-all duration-200"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Handle retweets
  if (post.isRetweet && post.originalPost) {
    return (
      <div className="border-l-4 border-green-200 pl-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Repeat2 className="h-4 w-4" />
          <span>
            {post.author.firstName} {post.author.lastName} retweeted
          </span>
        </div>
        {renderPost(post.originalPost)}
      </div>
    )
  }

  return renderPost(post)
}

export default Post
