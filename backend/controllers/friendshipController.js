const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Follow = require('../models/Follow');
const mongoose = require('mongoose');

// @desc    Send friend request
// @route   POST /api/friends/request/:userId
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if trying to send request to self
    if (requesterId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if friendship already exists (either direction)
    const existingFriendship = await Follow.findOne({
      $or: [
        { follower: requesterId, following: userId },
        { follower: userId, following: requesterId }
      ]
    });

    if (existingFriendship) {
      let message = 'Friend request already exists';
      if (existingFriendship.status === 'accepted') {
        message = 'You are already friends';
      } else if (existingFriendship.status === 'pending') {
        message = 'Friend request already sent';
      }
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Create friendship request (pending)
    const friendship = new Follow({
      follower: requesterId,
      following: userId,
      status: 'pending'
    });

    await friendship.save();

    // Populate user data
    await friendship.populate('follower following', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      friendship
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Respond to friend request (accept/decline)
// @route   PUT /api/friends/respond/:friendshipId
// @access  Private
const respondToFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.id;

    // Validate action
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "decline"'
      });
    }

    // Find friendship request
    const friendship = await Follow.findOne({
      _id: friendshipId,
      following: userId,
      status: 'pending'
    }).populate('follower following', 'username firstName lastName avatar');

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found or already responded'
      });
    }

    if (action === 'accept') {
      // Accept the friendship - create mutual relationship
      friendship.status = 'accepted';
      friendship.respondedAt = new Date();
      await friendship.save();

      // Create the reverse relationship to make it truly mutual
      const reverseFriendship = new Follow({
        follower: userId,
        following: friendship.follower._id,
        status: 'accepted',
        followedAt: new Date()
      });
      await reverseFriendship.save();

      res.json({
        success: true,
        message: 'Friend request accepted successfully',
        friendship
      });
    } else {
      // Decline the friendship
      friendship.status = 'declined';
      friendship.respondedAt = new Date();
      await friendship.save();

      res.json({
        success: true,
        message: 'Friend request declined successfully',
        friendship
      });
    }
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's friends
// @route   GET /api/friends/:userId
// @access  Private
const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get friendships from Follow table where user is either follower or following
    // and status is 'accepted' (mutual friendship)
    const friendships = await Follow.find({
      $or: [
        { follower: userId, status: 'accepted' },
        { following: userId, status: 'accepted' }
      ]
    }).populate('follower following', 'username firstName lastName avatar bio location');

    // Extract friends data - the other user in each friendship
    // Use a Set to avoid duplicates
    const friendIds = new Set();
    const friends = [];
    
    for (const friendship of friendships) {
      const friend = friendship.follower._id.toString() === userId 
        ? friendship.following 
        : friendship.follower;
      
      // Only add if we haven't seen this friend before
      if (!friendIds.has(friend._id.toString())) {
        friendIds.add(friend._id.toString());
        friends.push({
          id: friend._id,
          username: friend.username,
          firstName: friend.firstName,
          lastName: friend.lastName,
          fullName: `${friend.firstName} ${friend.lastName}`,
          avatar: friend.avatar,
          bio: friend.bio,
          location: friend.location,
          friendshipId: friendship._id,
          friendsSince: friendship.followedAt
        });
      }
    }

    res.json({
      success: true,
      count: friends.length,
      friends
    });
  } catch (error) {
    console.error('Get user friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending friend requests (received)
// @route   GET /api/friends/requests/received
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Follow.find({
      following: userId,
      status: 'pending'
    }).populate('follower', 'username firstName lastName avatar bio')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      requester: {
        id: request.follower._id,
        username: request.follower.username,
        firstName: request.follower.firstName,
        lastName: request.follower.lastName,
        fullName: `${request.follower.firstName} ${request.follower.lastName}`,
        avatar: request.follower.avatar,
        bio: request.follower.bio
      },
      requestedAt: request.followedAt,
      createdAt: request.createdAt
    }));

    res.json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sent friend requests
// @route   GET /api/friends/requests/sent
// @access  Private
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Follow.find({
      follower: userId,
      status: 'pending'
    }).populate('following', 'username firstName lastName avatar bio')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      recipient: {
        id: request.following._id,
        username: request.following.username,
        firstName: request.following.firstName,
        lastName: request.following.lastName,
        fullName: `${request.following.firstName} ${request.following.lastName}`,
        avatar: request.following.avatar,
        bio: request.following.bio
      },
      requestedAt: request.followedAt,
      createdAt: request.createdAt
    }));

    res.json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendshipId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.id;

    const friendship = await Follow.findOne({
      _id: friendshipId,
      $or: [
        { follower: userId },
        { following: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }

    // Remove both directions of the friendship (mutual relationship)
    await Follow.deleteMany({
      $or: [
        { follower: friendship.follower, following: friendship.following },
        { follower: friendship.following, following: friendship.follower }
      ]
    });

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get mutual friends between two users
// @route   GET /api/friends/mutual/:userId
// @access  Private
const getMutualFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const mutualFriends = await Friendship.getMutualFriends(currentUserId, userId);

    res.json({
      success: true,
      count: mutualFriends.length,
      mutualFriends: mutualFriends.map(friend => ({
        id: friend._id,
        username: friend.username,
        firstName: friend.firstName,
        lastName: friend.lastName,
        fullName: `${friend.firstName} ${friend.lastName}`,
        avatar: friend.avatar
      }))
    });
  } catch (error) {
    console.error('Get mutual friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get friendship status between two users
// @route   GET /api/friends/status/:userId
// @access  Private
const getFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (currentUserId === userId) {
      return res.json({
        success: true,
        status: 'self'
      });
    }

    const status = await Friendship.getFriendshipStatus(currentUserId, userId);

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendFriendRequest,
  respondToFriendRequest,
  getUserFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  getMutualFriends,
  getFriendshipStatus
};
