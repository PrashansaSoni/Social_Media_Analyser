const express = require('express')
const router = express.Router()
const {
  searchUsers,
  getUserProfile,
  getFriendRequests,
  getSentRequests,
  respondToFriendRequest,
  cancelFriendRequest
} = require('../controllers/userController')
const auth = require('../middleware/auth')

// @route   GET /api/users/search
// @desc    Search users by name or username
// @access  Public
router.get('/search', searchUsers)

// @route   GET /api/users/friend-requests
// @desc    Get friend requests (received)
// @access  Private
router.get('/friend-requests', auth, getFriendRequests)

// @route   GET /api/users/sent-requests
// @desc    Get sent friend requests
// @access  Private
router.get('/sent-requests', auth, getSentRequests)

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/:userId', getUserProfile)

// @route   PUT /api/users/friend-requests/:requestId
// @desc    Respond to friend request (accept/reject)
// @access  Private
router.put('/friend-requests/:requestId', auth, respondToFriendRequest)

// @route   DELETE /api/users/friend-requests/:requestId
// @desc    Cancel sent friend request
// @access  Private
router.delete('/friend-requests/:requestId', auth, cancelFriendRequest)

module.exports = router
