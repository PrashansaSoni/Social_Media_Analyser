import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
}

// Friends API
export const friendsAPI = {
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  respondToRequest: (friendshipId, action) => 
    api.put(`/friends/respond/${friendshipId}`, { action }),
  getUserFriends: (userId) => api.get(`/friends/${userId}`),
  getPendingRequests: () => api.get('/friends/requests/received'),
  getSentRequests: () => api.get('/friends/requests/sent'),
  removeFriend: (friendshipId) => api.delete(`/friends/${friendshipId}`),
  getMutualFriends: (userId) => api.get(`/friends/mutual/${userId}`),
  getFriendshipStatus: (userId) => api.get(`/friends/status/${userId}`),
}

// Graph API
export const graphAPI = {
  getShortestPath: (id1, id2) => api.get(`/graph/path/${id1}/${id2}`),
  getMostInfluential: () => api.get('/graph/influencer'),
  getDegreeCentrality: (limit = 20) => api.get(`/graph/centrality?limit=${limit}`),
  getNetworkStats: () => api.get('/graph/stats'),
  getFriendSuggestions: (userId, limit = 10) => 
    api.get(`/graph/suggestions/${userId}?limit=${limit}`),
  getGraphData: () => api.get('/graph/data'),
  searchUsers: (query, limit = 10) => 
    api.get(`/graph/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  queryGemini: (query) => api.post('/graph/gemini', { query }),
}

// Posts API
export const postsAPI = {
  createPost: (postData) => api.post('/posts', postData),
  getFeed: (page = 1, limit = 20) => api.get(`/posts/feed?page=${page}&limit=${limit}`),
  getUserPosts: (userId, page = 1, limit = 20) => 
    api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  retweetPost: (postId) => api.post(`/posts/${postId}/retweet`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comment`, { content }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  searchPosts: (query, page = 1, limit = 20) => 
    api.get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
}

// Friend API
export const friendAPI = {
  sendFriendRequest: (userId) => api.post(`/follow/${userId}`),
  removeFriend: (userId) => api.delete(`/follow/${userId}`),
  getFollowStatus: (userId) => api.get(`/follow/${userId}/status`),
  getFollowers: (userId, page = 1, limit = 20) => 
    api.get(`/follow/${userId}/followers?page=${page}&limit=${limit}`),
  getFollowing: (userId, page = 1, limit = 20) => 
    api.get(`/follow/${userId}/following?page=${page}&limit=${limit}`),
  getMutualFollows: (userId) => api.get(`/follow/mutual/${userId}`),
  getFollowSuggestions: (limit = 10) => api.get(`/follow/suggestions?limit=${limit}`),
}

// Users API
export const usersAPI = {
  searchUsers: (query, page = 1, limit = 20) => 
    api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  getFriendRequests: (page = 1, limit = 20) => 
    api.get(`/users/friend-requests?page=${page}&limit=${limit}`),
  getSentRequests: (page = 1, limit = 20) => 
    api.get(`/users/sent-requests?page=${page}&limit=${limit}`),
  respondToFriendRequest: (requestId, action) => 
    api.put(`/users/friend-requests/${requestId}`, { action }),
  cancelFriendRequest: (requestId) => 
    api.delete(`/users/friend-requests/${requestId}`),
}

export default api
