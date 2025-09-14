const Follow = require('../models/Follow')
const User = require('../models/User')

// @desc    Send friend request to a user
// @route   POST /api/follow/:userId
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    // Check if trying to send friend request to self
    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send friend request to yourself'
      })
    }

    // Check if user exists
    const userToFollow = await User.findById(userId)
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if already friends or request already sent
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    })

    if (existingFollow) {
      if (existingFollow.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already friends with this user'
        })
      } else if (existingFollow.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent'
        })
      }
    }

    // Create friend request
    const follow = new Follow({
      follower: followerId,
      following: userId,
      status: 'pending'
    })
    await follow.save()

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully'
    })
  } catch (error) {
    console.error('Error sending friend request:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    })
  }
}

// @desc    Remove friend (unfriend)
// @route   DELETE /api/follow/:userId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    // Check if friend relationship exists
    const follow = await Follow.findOne({
      follower: followerId,
      following: userId
    })

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'You are not friends with this user'
      })
    }

    // Remove friend relationship
    await Follow.findByIdAndDelete(follow._id)

    // Only update friend counts if the friendship was accepted
    if (follow.status === 'accepted') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } })
      await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } })
    }

    res.json({
      success: true,
      message: 'Friend removed successfully'
    })
  } catch (error) {
    console.error('Error removing friend:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    })
  }
}

// @desc    Check if user follows another user
// @route   GET /api/follow/:userId/status
// @access  Private
const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    const isFollowing = await Follow.isFollowing(followerId, userId)

    res.json({
      success: true,
      isFollowing: !!isFollowing
    })
  } catch (error) {
    console.error('Error checking follow status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status'
    })
  }
}

// @desc    Get user's followers
// @route   GET /api/follow/:userId/followers
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const followers = await Follow.getFollowers(userId, parseInt(limit), skip)
    const totalFollowers = await Follow.getFollowersCount(userId)

    res.json({
      success: true,
      followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFollowers,
        hasMore: followers.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching followers:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers'
    })
  }
}

// @desc    Get users that a user follows
// @route   GET /api/follow/:userId/following
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const following = await Follow.getFollowing(userId, parseInt(limit), skip)
    const totalFollowing = await Follow.getFollowingCount(userId)

    res.json({
      success: true,
      following,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFollowing,
        hasMore: following.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching following:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following'
    })
  }
}

// @desc    Get mutual follows between two users
// @route   GET /api/follow/mutual/:userId
// @access  Private
const getMutualFollows = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    const mutualFollows = await Follow.getMutualFollows(currentUserId, userId)

    res.json({
      success: true,
      mutualFollows
    })
  } catch (error) {
    console.error('Error fetching mutual follows:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mutual follows'
    })
  }
}

// @desc    Get follow suggestions
// @route   GET /api/follow/suggestions
// @access  Private
const getFollowSuggestions = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 10 } = req.query

    // Get users that the current user follows
    const following = await Follow.find({ follower: userId }).select('following')
    const followingIds = following.map(f => f.following)
    followingIds.push(userId) // Exclude self

    // Get users that are followed by people the current user follows
    const suggestions = await Follow.aggregate([
      {
        $match: {
          follower: { $in: followingIds },
          following: { $nin: followingIds }
        }
      },
      {
        $group: {
          _id: '$following',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          avatar: '$user.avatar',
          bio: '$user.bio',
          isVerified: '$user.isVerified',
          followersCount: '$user.followersCount',
          mutualConnections: '$count'
        }
      }
    ])

    res.json({
      success: true,
      suggestions
    })
  } catch (error) {
    console.error('Error fetching follow suggestions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch follow suggestions'
    })
  }
}

module.exports = {
  sendFriendRequest,
  removeFriend,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getMutualFollows,
  getFollowSuggestions
}
