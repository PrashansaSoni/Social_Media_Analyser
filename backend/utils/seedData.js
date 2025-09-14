require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const connectDB = require('../config/database');

const sampleUsers = [
  {
    username: 'alice_johnson',
    email: 'alice@example.com',
    password: 'Password123',
    firstName: 'Alice',
    lastName: 'Johnson',
    bio: 'Software engineer passionate about AI and machine learning',
    location: 'San Francisco, CA'
  },
  {
    username: 'bob_smith',
    email: 'bob@example.com',
    password: 'Password123',
    firstName: 'Bob',
    lastName: 'Smith',
    bio: 'Full-stack developer and tech enthusiast',
    location: 'New York, NY'
  },
  {
    username: 'charlie_brown',
    email: 'charlie@example.com',
    password: 'Password123',
    firstName: 'Charlie',
    lastName: 'Brown',
    bio: 'Data scientist and analytics expert',
    location: 'Austin, TX'
  },
  {
    username: 'diana_prince',
    email: 'diana@example.com',
    password: 'Password123',
    firstName: 'Diana',
    lastName: 'Prince',
    bio: 'UX designer with a passion for user-centered design',
    location: 'Seattle, WA'
  },
  {
    username: 'eve_adams',
    email: 'eve@example.com',
    password: 'Password123',
    firstName: 'Eve',
    lastName: 'Adams',
    bio: 'Product manager and startup founder',
    location: 'Los Angeles, CA'
  },
  {
    username: 'frank_miller',
    email: 'frank@example.com',
    password: 'Password123',
    firstName: 'Frank',
    lastName: 'Miller',
    bio: 'DevOps engineer and cloud architecture specialist',
    location: 'Denver, CO'
  },
  {
    username: 'grace_hopper',
    email: 'grace@example.com',
    password: 'Password123',
    firstName: 'Grace',
    lastName: 'Hopper',
    bio: 'Computer scientist and programming pioneer',
    location: 'Boston, MA'
  },
  {
    username: 'henry_ford',
    email: 'henry@example.com',
    password: 'Password123',
    firstName: 'Henry',
    lastName: 'Ford',
    bio: 'Innovation enthusiast and technology leader',
    location: 'Detroit, MI'
  },
  {
    username: 'ivy_chen',
    email: 'ivy@example.com',
    password: 'Password123',
    firstName: 'Ivy',
    lastName: 'Chen',
    bio: 'Mobile app developer and UI/UX designer',
    location: 'Portland, OR'
  },
  {
    username: 'jack_wilson',
    email: 'jack@example.com',
    password: 'Password123',
    firstName: 'Jack',
    lastName: 'Wilson',
    bio: 'Cybersecurity expert and ethical hacker',
    location: 'Chicago, IL'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Friendship.deleteMany({});
    
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);
    
    console.log('🤝 Creating sample friendships...');
    const friendships = [];
    
    // Create a connected network with various friendship patterns
    const userIds = createdUsers.map(user => user._id);
    
    // Create some accepted friendships
    const acceptedFriendships = [
      [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], 
      [3, 5], [4, 5], [4, 6], [5, 7], [6, 8], 
      [7, 8], [8, 9], [1, 9], [0, 6]
    ];
    
    for (const [i, j] of acceptedFriendships) {
      friendships.push({
        requester: userIds[i],
        recipient: userIds[j],
        status: 'accepted',
        requestedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        respondedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000)
      });
    }
    
    // Create some pending friendships
    const pendingFriendships = [
      [0, 7], [3, 9], [5, 9]
    ];
    
    for (const [i, j] of pendingFriendships) {
      friendships.push({
        requester: userIds[i],
        recipient: userIds[j],
        status: 'pending',
        requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
      });
    }
    
    await Friendship.insertMany(friendships);
    console.log(`✅ Created ${friendships.length} friendships`);
    
    console.log('📊 Database seeded successfully!');
    console.log('\n🔐 Sample login credentials:');
    console.log('Email: alice@example.com | Password: Password123');
    console.log('Email: bob@example.com | Password: Password123');
    console.log('Email: charlie@example.com | Password: Password123');
    console.log('(All users have the same password: Password123)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
