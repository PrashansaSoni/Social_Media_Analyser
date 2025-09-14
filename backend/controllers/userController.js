const User = require('../models/User')
const Follow = require('../models/Follow')

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const searchRegex = new RegExp(q.trim(), 'i')
    
    const users = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { username: searchRegex },
        { email: searchRegex }
      ],
      isActive: true
    })
    .select('username firstName lastName avatar bio isVerified followersCount followingCount postsCount')
    .sort({ followersCount: -1, postsCount: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    })
  }
}

// @desc    Get user profile by ID
// @route   GET /api/users/:userId
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
      .select('username firstName lastName avatar bio location website isVerified followersCount followingCount postsCount createdAt')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
}

// @desc    Get friend requests (received)
// @route   GET /api/users/friend-requests
// @access  Private
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    // Get pending friend requests where current user is the one being followed
    const friendRequests = await Follow.find({
      following: userId,
      status: 'pending'
    })
    .populate('follower', 'username firstName lastName avatar bio isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      friendRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: friendRequests.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend requests'
    })
  }
}

// @desc    Get sent friend requests
// @route   GET /api/users/sent-requests
// @access  Private
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    // Get all friend requests where current user is the follower
    const sentRequests = await Follow.find({
      follower: userId
    })
    .populate('following', 'username firstName lastName avatar bio isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      sentRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: sentRequests.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sent requests:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent requests'
    })
  }
}

// @desc    Respond to friend request (accept/reject)
// @route   PUT /api/users/friend-requests/:requestId
// @access  Private
const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const { action } = req.body // 'accept' or 'reject'
    const userId = req.user.id

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "accept" or "reject"'
      })
    }

    const friendRequest = await Follow.findById(requestId)

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      })
    }

    // Check if the current user is the one being followed
    if (friendRequest.following.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request'
      })
    }

    if (action === 'accept') {
      // Accept the request
      friendRequest.status = 'accepted'
      await friendRequest.save()

      // Update friend counts
      await User.findByIdAndUpdate(friendRequest.follower, { $inc: { followingCount: 1 } })
      await User.findByIdAndUpdate(friendRequest.following, { $inc: { followersCount: 1 } })

      res.json({
        success: true,
        message: 'Friend request accepted'
      })
    } else {
      // Reject the request
      await Follow.findByIdAndDelete(requestId)

      res.json({
        success: true,
        message: 'Friend request rejected'
      })
    }
  } catch (error) {
    console.error('Error responding to friend request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to respond to friend request'
    })
  }
}

// @desc    Cancel sent friend request
// @route   DELETE /api/users/friend-requests/:requestId
// @access  Private
const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const userId = req.user.id

    const friendRequest = await Follow.findById(requestId)

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      })
    }

    // Check if the current user is the one who sent the request
    if (friendRequest.follower.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      })
    }

    await Follow.findByIdAndDelete(requestId)

    res.json({
      success: true,
      message: 'Friend request cancelled'
    })
  } catch (error) {
    console.error('Error cancelling friend request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel friend request'
    })
  }
}

module.exports = {
  searchUsers,
  getUserProfile,
  getFriendRequests,
  getSentRequests,
  respondToFriendRequest,
  cancelFriendRequest
}
