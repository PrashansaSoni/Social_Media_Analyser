const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted' // For backward compatibility, existing follows are accepted
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Compound index to ensure unique follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true })

// Index for efficient queries
followSchema.index({ follower: 1 })
followSchema.index({ following: 1 })

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error('Users cannot follow themselves')
    return next(error)
  }
  next()
})

// Static method to check if user A follows user B
followSchema.statics.isFollowing = function(followerId, followingId) {
  return this.findOne({ follower: followerId, following: followingId })
}

// Static method to get followers count
followSchema.statics.getFollowersCount = function(userId) {
  return this.countDocuments({ following: userId })
}

// Static method to get following count
followSchema.statics.getFollowingCount = function(userId) {
  return this.countDocuments({ follower: userId })
}

// Static method to get followers list
followSchema.statics.getFollowers = function(userId, limit = 20, skip = 0) {
  return this.find({ following: userId })
    .populate('follower', 'username firstName lastName avatar bio')
    .sort({ followedAt: -1 })
    .limit(limit)
    .skip(skip)
}

// Static method to get following list
followSchema.statics.getFollowing = function(userId, limit = 20, skip = 0) {
  return this.find({ follower: userId })
    .populate('following', 'username firstName lastName avatar bio')
    .sort({ followedAt: -1 })
    .limit(limit)
    .skip(skip)
}

// Static method to get mutual follows
followSchema.statics.getMutualFollows = function(userId1, userId2) {
  return this.aggregate([
    {
      $match: {
        follower: { $in: [userId1, userId2] }
      }
    },
    {
      $group: {
        _id: '$following',
        followers: { $addToSet: '$follower' }
      }
    },
    {
      $match: {
        followers: { $size: 2 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: '$user._id',
        username: '$user.username',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        avatar: '$user.avatar',
        bio: '$user.bio'
      }
    }
  ])
}

module.exports = mongoose.model('Follow', followSchema)
