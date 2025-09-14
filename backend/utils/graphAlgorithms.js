const User = require('../models/User');
const Follow = require('../models/Follow');

/**
 * Build adjacency list representation of the social network
 * @returns {Object} Adjacency list where keys are user IDs and values are arrays of connected user IDs
 */
const buildGraph = async () => {
  try {
    // Get all accepted friend relationships
    const friendships = await Follow.find({ status: 'accepted' });
    
    // Build adjacency list
    const graph = {};
    
    friendships.forEach(friendship => {
      const user1 = friendship.follower.toString();
      const user2 = friendship.following.toString();
      
      // Initialize arrays if they don't exist
      if (!graph[user1]) graph[user1] = [];
      if (!graph[user2]) graph[user2] = [];
      
      // Add bidirectional edges (friendship is mutual)
      graph[user1].push(user2);
      graph[user2].push(user1);
    });
    
    return graph;
  } catch (error) {
    console.error('Error building graph:', error);
    throw error;
  }
};

/**
 * Find shortest path between two users using BFS
 * @param {string} startUserId - Starting user ID
 * @param {string} endUserId - Target user ID
 * @returns {Object} Path information including distance and route
 */
const findShortestPath = async (startUserId, endUserId) => {
  try {
    if (startUserId === endUserId) {
      return {
        distance: 0,
        path: [startUserId],
        exists: true
      };
    }

    const graph = await buildGraph();
    
    // If either user has no connections, no path exists
    if (!graph[startUserId] || !graph[endUserId]) {
      return {
        distance: -1,
        path: [],
        exists: false
      };
    }

    // BFS implementation
    const queue = [startUserId];
    const visited = new Set([startUserId]);
    const parent = { [startUserId]: null };
    const distance = { [startUserId]: 0 };

    while (queue.length > 0) {
      const currentUser = queue.shift();
      
      // Check all neighbors
      const neighbors = graph[currentUser] || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent[neighbor] = currentUser;
          distance[neighbor] = distance[currentUser] + 1;
          queue.push(neighbor);
          
          // Found target user
          if (neighbor === endUserId) {
            // Reconstruct path
            const path = [];
            let current = endUserId;
            
            while (current !== null) {
              path.unshift(current);
              current = parent[current];
            }
            
            return {
              distance: distance[endUserId],
              path,
              exists: true
            };
          }
        }
      }
    }

    // No path found
    return {
      distance: -1,
      path: [],
      exists: false
    };
  } catch (error) {
    console.error('Error finding shortest path:', error);
    throw error;
  }
};

/**
 * Calculate degree centrality for all users
 * @returns {Array} Array of users sorted by degree centrality (descending)
 */
const calculateDegreeCentrality = async () => {
  try {
    const graph = await buildGraph();
    const users = await User.find({ isActive: true }, 'username firstName lastName avatar');
    
    const centralities = users.map(user => {
      const userId = user._id.toString();
      const degree = graph[userId] ? graph[userId].length : 0;
      
      return {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar
        },
        degree,
        centrality: degree // In a simple graph, degree centrality is just the degree
      };
    });
    
    // Sort by degree (descending)
    centralities.sort((a, b) => b.degree - a.degree);
    
    return centralities;
  } catch (error) {
    console.error('Error calculating degree centrality:', error);
    throw error;
  }
};

/**
 * Find the most influential user (highest degree centrality)
 * @returns {Object} User with highest degree centrality
 */
const findMostInfluentialUser = async () => {
  try {
    const centralities = await calculateDegreeCentrality();
    
    if (centralities.length === 0) {
      return null;
    }
    
    return centralities[0];
  } catch (error) {
    console.error('Error finding most influential user:', error);
    throw error;
  }
};

/**
 * Get network statistics
 * @returns {Object} Network statistics including total users, connections, etc.
 */
const getNetworkStats = async () => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalFriendships = await Follow.countDocuments({ status: 'accepted' });
    const pendingRequests = await Follow.countDocuments({ status: 'pending' });
    
    const graph = await buildGraph();
    const connectedUsers = Object.keys(graph).length;
    const isolatedUsers = totalUsers - connectedUsers;
    
    // Calculate average degree
    let totalDegree = 0;
    Object.values(graph).forEach(neighbors => {
      totalDegree += neighbors.length;
    });
    const averageDegree = connectedUsers > 0 ? totalDegree / connectedUsers : 0;
    
    // Find components (connected subgraphs)
    const components = findConnectedComponents(graph);
    
    return {
      totalUsers,
      connectedUsers,
      isolatedUsers,
      totalFriendships,
      pendingRequests,
      averageDegree: Math.round(averageDegree * 100) / 100,
      connectedComponents: components.length,
      largestComponent: components.length > 0 ? Math.max(...components.map(c => c.length)) : 0
    };
  } catch (error) {
    console.error('Error getting network stats:', error);
    throw error;
  }
};

/**
 * Find connected components in the graph
 * @param {Object} graph - Adjacency list representation
 * @returns {Array} Array of connected components (each component is an array of user IDs)
 */
const findConnectedComponents = (graph) => {
  const visited = new Set();
  const components = [];
  
  const dfs = (node, component) => {
    visited.add(node);
    component.push(node);
    
    const neighbors = graph[node] || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component);
      }
    });
  };
  
  Object.keys(graph).forEach(node => {
    if (!visited.has(node)) {
      const component = [];
      dfs(node, component);
      components.push(component);
    }
  });
  
  return components;
};

/**
 * Suggest friends based on mutual connections
 * @param {string} userId - User ID to find suggestions for
 * @param {number} limit - Maximum number of suggestions
 * @returns {Array} Array of suggested users with mutual friend count
 */
const suggestFriends = async (userId, limit = 10) => {
  try {
    const graph = await buildGraph();
    const userFriends = graph[userId] || [];
    
    if (userFriends.length === 0) {
      return [];
    }
    
    // Count mutual connections for each potential friend
    const mutualCounts = {};
    
    userFriends.forEach(friendId => {
      const friendsFriends = graph[friendId] || [];
      
      friendsFriends.forEach(potentialFriend => {
        // Skip if it's the user themselves or already a friend
        if (potentialFriend === userId || userFriends.includes(potentialFriend)) {
          return;
        }
        
        mutualCounts[potentialFriend] = (mutualCounts[potentialFriend] || 0) + 1;
      });
    });
    
    // Convert to array and sort by mutual count
    const suggestions = Object.entries(mutualCounts)
      .map(([userId, mutualCount]) => ({ userId, mutualCount }))
      .sort((a, b) => b.mutualCount - a.mutualCount)
      .slice(0, limit);
    
    // Get user details
    const userIds = suggestions.map(s => s.userId);
    const users = await User.find(
      { _id: { $in: userIds }, isActive: true },
      'username firstName lastName avatar bio'
    );
    
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    return suggestions
      .filter(s => userMap[s.userId])
      .map(s => ({
        user: {
          id: userMap[s.userId]._id,
          username: userMap[s.userId].username,
          firstName: userMap[s.userId].firstName,
          lastName: userMap[s.userId].lastName,
          fullName: `${userMap[s.userId].firstName} ${userMap[s.userId].lastName}`,
          avatar: userMap[s.userId].avatar,
          bio: userMap[s.userId].bio
        },
        mutualFriends: s.mutualCount
      }));
  } catch (error) {
    console.error('Error suggesting friends:', error);
    throw error;
  }
};

module.exports = {
  buildGraph,
  findShortestPath,
  calculateDegreeCentrality,
  findMostInfluentialUser,
  getNetworkStats,
  findConnectedComponents,
  suggestFriends
};
