const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate friendship requests
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for better query performance
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

// Ensure users can't send friend requests to themselves
friendshipSchema.pre('save', function(next) {
  if (this.requester.equals(this.recipient)) {
    const error = new Error('Users cannot send friend requests to themselves');
    return next(error);
  }
  next();
});

// Static method to get mutual friends
friendshipSchema.statics.getMutualFriends = async function(userId1, userId2) {
  const user1Friends = await this.find({
    $or: [
      { requester: userId1, status: 'accepted' },
      { recipient: userId1, status: 'accepted' }
    ]
  }).populate('requester recipient', 'username firstName lastName avatar');

  const user2Friends = await this.find({
    $or: [
      { requester: userId2, status: 'accepted' },
      { recipient: userId2, status: 'accepted' }
    ]
  }).populate('requester recipient', 'username firstName lastName avatar');

  // Extract friend IDs for both users
  const user1FriendIds = new Set();
  user1Friends.forEach(friendship => {
    const friendId = friendship.requester._id.equals(userId1) 
      ? friendship.recipient._id.toString() 
      : friendship.requester._id.toString();
    user1FriendIds.add(friendId);
  });

  const mutualFriends = [];
  user2Friends.forEach(friendship => {
    const friendId = friendship.requester._id.equals(userId2) 
      ? friendship.recipient._id.toString() 
      : friendship.requester._id.toString();
    
    if (user1FriendIds.has(friendId)) {
      const friend = friendship.requester._id.equals(userId2) 
        ? friendship.recipient 
        : friendship.requester;
      mutualFriends.push(friend);
    }
  });

  return mutualFriends;
};

// Static method to check if users are friends
friendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const friendship = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!friendship;
};

// Static method to get friendship status
friendshipSchema.statics.getFriendshipStatus = async function(userId1, userId2) {
  const friendship = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });

  if (!friendship) return 'none';
  
  return {
    status: friendship.status,
    requester: friendship.requester.toString(),
    recipient: friendship.recipient.toString()
  };
};

module.exports = mongoose.model('Friendship', friendshipSchema);
