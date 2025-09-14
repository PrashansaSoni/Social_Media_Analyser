const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  respondToFriendRequest,
  getUserFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  getMutualFriends,
  getFriendshipStatus
} = require('../controllers/friendshipController');
const auth = require('../middleware/auth');

// @route   POST /api/friends/request/:userId
// @desc    Send friend request
// @access  Private
router.post('/request/:userId', auth, sendFriendRequest);

// @route   PUT /api/friends/respond/:friendshipId
// @desc    Respond to friend request (accept/decline)
// @access  Private
router.put('/respond/:friendshipId', auth, respondToFriendRequest);

// @route   GET /api/friends/:userId
// @desc    Get user's friends
// @access  Private
router.get('/:userId', auth, getUserFriends);

// @route   GET /api/friends/requests/received
// @desc    Get pending friend requests (received)
// @access  Private
router.get('/requests/received', auth, getPendingRequests);

// @route   GET /api/friends/requests/sent
// @desc    Get sent friend requests
// @access  Private
router.get('/requests/sent', auth, getSentRequests);

// @route   DELETE /api/friends/:friendshipId
// @desc    Remove friend
// @access  Private
router.delete('/:friendshipId', auth, removeFriend);

// @route   GET /api/friends/mutual/:userId
// @desc    Get mutual friends between current user and specified user
// @access  Private
router.get('/mutual/:userId', auth, getMutualFriends);

// @route   GET /api/friends/status/:userId
// @desc    Get friendship status between current user and specified user
// @access  Private
router.get('/status/:userId', auth, getFriendshipStatus);

module.exports = router;
