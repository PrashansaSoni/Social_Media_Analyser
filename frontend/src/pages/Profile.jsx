import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { friendsAPI, graphAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Calendar,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [userStats, setUserStats] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    if (user) {
      fetchUserData()
      // Set form values
      setValue('firstName', user.firstName)
      setValue('lastName', user.lastName)
      setValue('bio', user.bio || '')
      setValue('location', user.location || '')
    }
  }, [user, setValue])

  const fetchUserData = async () => {
    try {
      const [friendsRes, suggestionsRes] = await Promise.all([
        friendsAPI.getUserFriends(user.id),
        graphAPI.getFriendSuggestions(user.id, 8)
      ])
      
      setFriends(friendsRes.data.friends)
      setSuggestions(suggestionsRes.data.suggestions)
      
      // Calculate user stats
      setUserStats({
        totalFriends: friendsRes.data.friends.length,
        joinedDate: user.createdAt,
        lastActive: user.lastLogin
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const result = await updateProfile(data)
      if (result.success) {
        setEditing(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    reset()
    // Reset form values
    setValue('firstName', user.firstName)
    setValue('lastName', user.lastName)
    setValue('bio', user.bio || '')
    setValue('location', user.location || '')
  }

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId)
      toast.success('Friend request sent!')
      fetchUserData() // Refresh suggestions
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your profile and view your network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">@{user?.username}</p>
                </div>

                {editing ? (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register('firstName', {
                            required: 'First name is required'
                          })}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register('lastName', {
                            required: 'Last name is required'
                          })}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us about yourself"
                        {...register('bio')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        {...register('location')}
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {user?.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Bio
                        </h4>
                        <p className="text-sm">{user.bio}</p>
                      </div>
                    )}

                    {user?.location && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user?.createdAt)}</span>
                    </div>

                    {userStats && (
                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {userStats.totalFriends}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Friends
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="friends" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Your Friends ({friends.length})</span>
                    </CardTitle>
                    <CardDescription>
                      People you're connected with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {friends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No friends yet</p>
                        <p className="text-sm text-muted-foreground">
                          Check out the suggestions tab to connect with people!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar>
                              <AvatarImage src={friend.avatar} alt={friend.username} />
                              <AvatarFallback>
                                {getInitials(friend.firstName, friend.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{friend.fullName}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                @{friend.username}
                              </p>
                              {friend.location && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {friend.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Friend Suggestions</span>
                    </CardTitle>
                    <CardDescription>
                      People you might know based on mutual connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {suggestions.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No suggestions available</p>
                        <p className="text-sm text-muted-foreground">
                          Connect with more people to get better suggestions!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion.user.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Avatar>
                                <AvatarImage 
                                  src={suggestion.user.avatar} 
                                  alt={suggestion.user.username} 
                                />
                                <AvatarFallback>
                                  {getInitials(
                                    suggestion.user.firstName, 
                                    suggestion.user.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {suggestion.user.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  @{suggestion.user.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {suggestion.mutualFriends} mutual friends
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSendFriendRequest(suggestion.user.id)}
                            >
                              Connect
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
