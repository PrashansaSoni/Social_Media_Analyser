const Post = require('../models/Post')
const User = require('../models/User')
const Follow = require('../models/Follow')

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, media, parentPost } = req.body
    const userId = req.user.id

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      })
    }

    if (content.length > 280) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot exceed 280 characters'
      })
    }

    // Extract mentions from content
    const mentionRegex = /@[\w\u0590-\u05ff]+/g
    const mentionUsernames = content.match(mentionRegex) || []
    const mentions = []

    // Resolve usernames to user IDs
    for (const username of mentionUsernames) {
      const user = await User.findOne({ username: username.substring(1) })
      if (user) {
        mentions.push(user._id)
      }
    }

    const postData = {
      author: userId,
      content: content.trim(),
      mentions,
      parentPost: parentPost || null
    }

    if (media && media.length > 0) {
      postData.media = media
    }

    const post = new Post(postData)
    await post.save()

    // Populate author information
    await post.populate('author', 'username firstName lastName avatar isVerified')

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } })

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    })
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    })
  }
}

// @desc    Get timeline/feed posts
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    // Get users that the current user follows
    const following = await Follow.find({ follower: userId }).select('following')
    const followingIds = following.map(f => f.following)
    
    // Include current user's posts in feed
    followingIds.push(userId)

    const posts = await Post.find({
      author: { $in: followingIds },
      isDeleted: false
    })
    .populate('author', 'username firstName lastName avatar isVerified')
    .populate('originalPost')
    .populate('originalPost.author', 'username firstName lastName avatar isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed'
    })
  }
}

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const posts = await Post.find({
      author: userId,
      isDeleted: false
    })
    .populate('author', 'username firstName lastName avatar isVerified')
    .populate('originalPost')
    .populate('originalPost.author', 'username firstName lastName avatar isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching user posts:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts'
    })
  }
}

// @desc    Get a single post
// @route   GET /api/posts/:postId
// @access  Public
const getPost = async (req, res) => {
  try {
    const { postId } = req.params

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false
    })
    .populate('author', 'username firstName lastName avatar isVerified')
    .populate('comments.author', 'username firstName lastName avatar isVerified')
    .populate('originalPost')
    .populate('originalPost.author', 'username firstName lastName avatar isVerified')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    res.json({
      success: true,
      post
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    })
  }
}

// @desc    Like/Unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    const isLiked = post.isLikedBy(userId)

    if (isLiked) {
      await post.removeLike(userId)
    } else {
      await post.addLike(userId)
    }

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likeCount: post.likeCount
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    })
  }
}

// @desc    Retweet/Unretweet a post
// @route   POST /api/posts/:postId/retweet
// @access  Private
const toggleRetweet = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user.id

    const originalPost = await Post.findById(postId)
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    const isRetweeted = originalPost.isRetweetedBy(userId)

    if (isRetweeted) {
      // Remove retweet
      await originalPost.removeRetweet(userId)
      
      // Delete the retweet post
      await Post.findOneAndDelete({
        author: userId,
        originalPost: postId,
        isRetweet: true
      })
    } else {
      // Add retweet
      await originalPost.addRetweet(userId)
      
      // Create retweet post
      const retweetPost = new Post({
        author: userId,
        content: '',
        isRetweet: true,
        originalPost: postId
      })
      await retweetPost.save()
    }

    res.json({
      success: true,
      message: isRetweeted ? 'Retweet removed' : 'Post retweeted',
      isRetweeted: !isRetweeted,
      retweetCount: originalPost.retweetCount
    })
  } catch (error) {
    console.error('Error toggling retweet:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle retweet'
    })
  }
}

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { content } = req.body
    const userId = req.user.id

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      })
    }

    if (content.length > 280) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot exceed 280 characters'
      })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    await post.addComment(userId, content.trim())

    // Populate the new comment
    await post.populate('comments.author', 'username firstName lastName avatar isVerified')

    const newComment = post.comments[post.comments.length - 1]

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    })
  }
}

// @desc    Delete a post
// @route   DELETE /api/posts/:postId
// @access  Private
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      })
    }

    // Soft delete
    post.isDeleted = true
    post.deletedAt = new Date()
    await post.save()

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: -1 } })

    res.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    })
  }
}

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
const searchPosts = async (req, res) => {
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
    
    const posts = await Post.find({
      content: searchRegex,
      isDeleted: false
    })
    .populate('author', 'username firstName lastName avatar isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error searching posts:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search posts'
    })
  }
}

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  toggleLike,
  toggleRetweet,
  addComment,
  deletePost,
  searchPosts
}
