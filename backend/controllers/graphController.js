const User = require('../models/User');
const { 
  findShortestPath, 
  calculateDegreeCentrality, 
  findMostInfluentialUser,
  getNetworkStats,
  suggestFriends
} = require('../utils/graphAlgorithms');
const geminiService = require('../services/geminiService');
const mongoose = require('mongoose');

// @desc    Get shortest path between two users
// @route   GET /api/graph/path/:id1/:id2
// @access  Private
const getShortestPath = async (req, res) => {
  try {
    const { id1, id2 } = req.params;

    // Validate user IDs
    if (!mongoose.Types.ObjectId.isValid(id1) || !mongoose.Types.ObjectId.isValid(id2)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user IDs'
      });
    }

    // Check if users exist
    const [user1, user2] = await Promise.all([
      User.findById(id1, 'username firstName lastName avatar'),
      User.findById(id2, 'username firstName lastName avatar')
    ]);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Find shortest path
    const pathResult = await findShortestPath(id1, id2);

    if (!pathResult.exists) {
      return res.json({
        success: true,
        message: 'No path exists between these users',
        path: {
          exists: false,
          distance: -1,
          users: []
        }
      });
    }

    // Get user details for the path
    const pathUserIds = pathResult.path;
    const pathUsers = await User.find(
      { _id: { $in: pathUserIds } },
      'username firstName lastName avatar'
    );

    // Create user map for quick lookup
    const userMap = {};
    pathUsers.forEach(user => {
      userMap[user._id.toString()] = {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar
      };
    });

    // Build ordered path with user details
    const orderedPath = pathUserIds.map(userId => userMap[userId]);

    res.json({
      success: true,
      path: {
        exists: true,
        distance: pathResult.distance,
        users: orderedPath,
        connections: pathResult.distance
      }
    });
  } catch (error) {
    console.error('Get shortest path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get most influential user (highest degree centrality)
// @route   GET /api/graph/influencer
// @access  Private
const getMostInfluentialUser = async (req, res) => {
  try {
    const influencer = await findMostInfluentialUser();

    if (!influencer) {
      return res.json({
        success: true,
        message: 'No users found in the network',
        influencer: null
      });
    }

    res.json({
      success: true,
      influencer: {
        user: influencer.user,
        connections: influencer.degree,
        centrality: influencer.centrality
      }
    });
  } catch (error) {
    console.error('Get most influential user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get degree centrality for all users
// @route   GET /api/graph/centrality
// @access  Private
const getDegreeCentrality = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const centralities = await calculateDegreeCentrality();
    const limitedResults = centralities.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: limitedResults.length,
      total: centralities.length,
      users: limitedResults.map(item => ({
        user: item.user,
        connections: item.degree,
        centrality: item.centrality
      }))
    });
  } catch (error) {
    console.error('Get degree centrality error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get network statistics
// @route   GET /api/graph/stats
// @access  Private
const getNetworkStatistics = async (req, res) => {
  try {
    const stats = await getNetworkStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get network stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get friend suggestions for a user
// @route   GET /api/graph/suggestions/:userId
// @access  Private
const getFriendSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Validate user ID
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

    const suggestions = await suggestFriends(userId, parseInt(limit));

    res.json({
      success: true,
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get graph data for visualization
// @route   GET /api/graph/data
// @access  Private
const getGraphData = async (req, res) => {
  try {
    const { buildGraph } = require('../utils/graphAlgorithms');
    
    // Get all users
    const users = await User.find(
      { isActive: true },
      'username firstName lastName avatar bio'
    );

    // Build the graph
    const graph = await buildGraph();

    // Format nodes
    const nodes = users.map(user => ({
      id: user._id.toString(),
      label: user.username,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      bio: user.bio,
      connections: graph[user._id.toString()]?.length || 0
    }));

    // Format edges
    const edges = [];
    const processedPairs = new Set();

    Object.entries(graph).forEach(([userId, connections]) => {
      connections.forEach(connectedUserId => {
        const pair = [userId, connectedUserId].sort().join('-');
        if (!processedPairs.has(pair)) {
          processedPairs.add(pair);
          edges.push({
            source: userId,
            target: connectedUserId
          });
        }
      });
    });

    res.json({
      success: true,
      graph: {
        nodes,
        edges
      },
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length
      }
    });
  } catch (error) {
    console.error('Get graph data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search users for graph operations
// @route   GET /api/graph/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      isActive: true,
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    }, 'username firstName lastName avatar bio')
      .limit(parseInt(limit))
      .sort({ username: 1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      bio: user.bio
    }));

    res.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Query Gemini AI about network data
// @route   POST /api/graph/gemini
// @access  Private
const queryGemini = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.'
      });
    }

    const response = await geminiService.processQuery(query.trim());

    res.json({
      success: true,
      response,
      query: query.trim()
    });
  } catch (error) {
    console.error('Gemini query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI query'
    });
  }
};

module.exports = {
  getShortestPath,
  getMostInfluentialUser,
  getDegreeCentrality,
  getNetworkStatistics,
  getFriendSuggestions,
  getGraphData,
  searchUsers,
  queryGemini
};
