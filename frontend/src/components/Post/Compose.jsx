import { useState, useRef } from 'react'
import { postsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Image, 
  Smile, 
  MapPin, 
  Calendar,
  X
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const Compose = ({ onPostCreated, placeholder = "What's happening?" }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() && media.length === 0) {
      toast.error('Please write something or add media')
      return
    }

    if (content.length > 280) {
      toast.error('Post content cannot exceed 280 characters')
      return
    }

    setLoading(true)

    try {
      const postData = {
        content: content.trim(),
        media: media.length > 0 ? media : undefined
      }

      await postsAPI.createPost(postData)
      
      setContent('')
      setMedia([])
      
      toast.success('Post created successfully!')
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const newMedia = {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: event.target.result,
          alt: file.name
        }
        setMedia(prev => [...prev, newMedia])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }

  const remainingChars = 280 - content.length

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="w-full resize-none border-none outline-none text-xl placeholder-gray-400 min-h-[120px] bg-transparent focus:ring-0"
                maxLength={280}
              />

              {/* Media Preview */}
              {media.length > 0 && (
                <div className="mt-4 space-y-3">
                  {media.map((item, index) => (
                    <div key={index} className="relative inline-block group">
                      {item.type === 'image' && (
                        <img 
                          src={item.url} 
                          alt={item.alt} 
                          className="max-h-64 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300"
                        />
                      )}
                      {item.type === 'video' && (
                        <video 
                          src={item.url} 
                          controls 
                          className="max-h-64 rounded-2xl shadow-md"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all duration-200"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all duration-200"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all duration-200"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-all duration-200"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  {content.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        remainingChars < 20 ? 'bg-red-500' : remainingChars < 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        remainingChars < 20 ? 'text-red-500' : remainingChars < 50 ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {remainingChars}
                      </span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading || (!content.trim() && media.length === 0)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </div>
                    ) : (
                      'Post'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMediaUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

export default Compose
