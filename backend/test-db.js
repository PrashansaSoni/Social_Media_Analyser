require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: 'alice@example.com' });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('User details:', {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      });
      
      // Test password comparison
      const isMatch = await user.comparePassword('Password123');
      console.log('Password match:', isMatch);
    } else {
      console.log('❌ User not found in database');
    }

    // Count all users
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testDatabase();
