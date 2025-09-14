const express = require('express')
const router = express.Router()
const {
  sendFriendRequest,
  removeFriend,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getMutualFollows,
  getFollowSuggestions
} = require('../controllers/followController')
const auth = require('../middleware/auth')

// @route   POST /api/follow/:userId
// @desc    Send friend request to a user
// @access  Private
router.post('/:userId', auth, sendFriendRequest)

// @route   DELETE /api/follow/:userId
// @desc    Remove friend (unfriend)
// @access  Private
router.delete('/:userId', auth, removeFriend)

// @route   GET /api/follow/:userId/status
// @desc    Check if user follows another user
// @access  Private
router.get('/:userId/status', auth, getFollowStatus)

// @route   GET /api/follow/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', getFollowers)

// @route   GET /api/follow/:userId/following
// @desc    Get users that a user follows
// @access  Public
router.get('/:userId/following', getFollowing)

// @route   GET /api/follow/mutual/:userId
// @desc    Get mutual follows between two users
// @access  Private
router.get('/mutual/:userId', auth, getMutualFollows)

// @route   GET /api/follow/suggestions
// @desc    Get follow suggestions
// @access  Private
router.get('/suggestions', auth, getFollowSuggestions)

module.exports = router
