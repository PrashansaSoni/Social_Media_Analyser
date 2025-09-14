const express = require('express');
const router = express.Router();
const {
  getShortestPath,
  getMostInfluentialUser,
  getDegreeCentrality,
  getNetworkStatistics,
  getFriendSuggestions,
  getGraphData,
  searchUsers,
  queryGemini
} = require('../controllers/graphController');
const auth = require('../middleware/auth');

// @route   GET /api/graph/path/:id1/:id2
// @desc    Get shortest path between two users
// @access  Private
router.get('/path/:id1/:id2', auth, getShortestPath);

// @route   GET /api/graph/influencer
// @desc    Get most influential user (highest degree centrality)
// @access  Private
router.get('/influencer', auth, getMostInfluentialUser);

// @route   GET /api/graph/centrality
// @desc    Get degree centrality for all users
// @access  Private
router.get('/centrality', auth, getDegreeCentrality);

// @route   GET /api/graph/stats
// @desc    Get network statistics
// @access  Private
router.get('/stats', auth, getNetworkStatistics);

// @route   GET /api/graph/suggestions/:userId
// @desc    Get friend suggestions for a user
// @access  Private
router.get('/suggestions/:userId', auth, getFriendSuggestions);

// @route   GET /api/graph/data
// @desc    Get graph data for visualization
// @access  Private
router.get('/data', auth, getGraphData);

// @route   GET /api/graph/users/search
// @desc    Search users for graph operations
// @access  Private
router.get('/users/search', auth, searchUsers);

// @route   POST /api/graph/gemini
// @desc    Query Gemini AI about network data
// @access  Private
router.post('/gemini', auth, queryGemini);

module.exports = router;
