const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return !this.isRetweet; // Content not required for retweets
    },
    maxlength: 280 // Twitter character limit
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  retweets: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    retweetedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 280
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null // For replies
  },
  isRetweet: {
    type: Boolean,
    default: false
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null // For retweets
  },
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
})

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ hashtags: 1 })
postSchema.index({ isDeleted: 1 })

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length
})

// Virtual for retweet count
postSchema.virtual('retweetCount').get(function() {
  return this.retweets.length
})

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length
})

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString())
}

// Method to check if user retweeted the post
postSchema.methods.isRetweetedBy = function(userId) {
  return this.retweets.some(retweet => retweet.user.toString() === userId.toString())
}

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId })
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString())
  return this.save()
}

// Method to add retweet
postSchema.methods.addRetweet = function(userId) {
  if (!this.isRetweetedBy(userId)) {
    this.retweets.push({ user: userId })
    return this.save()
  }
  return Promise.resolve(this)
}

// Method to remove retweet
postSchema.methods.removeRetweet = function(userId) {
  this.retweets = this.retweets.filter(retweet => retweet.user.toString() !== userId.toString())
  return this.save()
}

// Method to add comment
postSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  })
  return this.save()
}

// Pre-save middleware to extract hashtags and mentions
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    this.hashtags = (this.content.match(hashtagRegex) || []).map(tag => tag.toLowerCase())
    
    // Extract mentions (we'll need to implement username lookup)
    const mentionRegex = /@[\w\u0590-\u05ff]+/g
    const mentions = this.content.match(mentionRegex) || []
    // Note: We'll need to resolve usernames to user IDs in the controller
  }
  next()
})

module.exports = mongoose.model('Post', postSchema)
