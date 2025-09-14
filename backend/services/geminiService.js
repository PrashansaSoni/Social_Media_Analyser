const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Get comprehensive network data for AI analysis
  async getNetworkData() {
    try {
      // Ensure database connection
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
      }
      // Get all users with their basic info
      const users = await User.find({ isActive: true }, 'username firstName lastName bio location avatar')
        .sort({ createdAt: -1 });

      // Get all friendships
      const friendships = await Follow.find({ status: 'accepted' })
        .populate('follower following', 'username firstName lastName');

      // Get network statistics
      const totalUsers = users.length;
      const totalFriendships = friendships.length;
      const averageConnections = totalUsers > 0 ? totalFriendships / totalUsers : 0;

      // Get most connected users
      const userConnections = {};
      friendships.forEach(friendship => {
        const followerId = friendship.follower._id.toString();
        const followingId = friendship.following._id.toString();
        
        userConnections[followerId] = (userConnections[followerId] || 0) + 1;
        userConnections[followingId] = (userConnections[followingId] || 0) + 1;
      });

      const mostConnectedUsers = Object.entries(userConnections)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, connections]) => {
          const user = users.find(u => u._id.toString() === userId);
          return user ? {
            name: `${user.firstName} ${user.lastName}`,
            username: user.username,
            connections
          } : null;
        })
        .filter(Boolean);

      // Get recent posts for activity analysis
      const recentPosts = await Post.find()
        .populate('author', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20);

      // Get user locations for geographic analysis
      const locations = users
        .filter(user => user.location)
        .map(user => user.location)
        .reduce((acc, location) => {
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {});

      return {
        totalUsers,
        totalFriendships,
        averageConnections: Math.round(averageConnections * 100) / 100,
        mostConnectedUsers,
        recentPosts: recentPosts.map(post => ({
          content: post.content,
          author: `${post.author.firstName} ${post.author.lastName}`,
          createdAt: post.createdAt
        })),
        locations,
        users: users.map(user => ({
          name: `${user.firstName} ${user.lastName}`,
          username: user.username,
          bio: user.bio,
          location: user.location
        }))
      };
    } catch (error) {
      console.error('Error getting network data:', error);
      throw error;
    }
  }

  // Process user query with network data
  async processQuery(userQuery) {
    try {
      const networkData = await this.getNetworkData();
      
      const prompt = `
You are an AI assistant analyzing a social network database. Here's the current network data:

NETWORK STATISTICS:
- Total Users: ${networkData.totalUsers}
- Total Friendships: ${networkData.totalFriendships}
- Average Connections per User: ${networkData.averageConnections}

MOST CONNECTED USERS:
${networkData.mostConnectedUsers.map((user, index) => 
  `${index + 1}. ${user.name} (@${user.username}) - ${user.connections} connections`
).join('\n')}

USER LOCATIONS:
${Object.entries(networkData.locations).map(([location, count]) => 
  `- ${location}: ${count} users`
).join('\n')}

RECENT ACTIVITY (Last 20 posts):
${networkData.recentPosts.map(post => 
  `- ${post.author}: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`
).join('\n')}

USER PROFILES (Sample):
${networkData.users.slice(0, 10).map(user => 
  `- ${user.name} (@${user.username})${user.bio ? ` - ${user.bio}` : ''}${user.location ? ` - Location: ${user.location}` : ''}`
).join('\n')}

USER QUESTION: "${userQuery}"

Please provide a helpful, accurate response based on this network data. Focus on:
1. Network structure and connectivity patterns
2. User relationships and influence
3. Geographic distribution
4. Activity patterns
5. Specific insights about users or connections

Keep your response concise but informative. If the question is about specific users, try to find them in the data and provide relevant information.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error processing Gemini query:', error);
      throw new Error('Failed to process AI query');
    }
  }
}

module.exports = new GeminiService();
