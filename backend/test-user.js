require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testUserCreation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test user
    await User.deleteOne({ email: 'test@example.com' });

    // Create a new user manually
    const user = new User({
      username: 'test_user',
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    });

    await user.save();
    console.log('✅ User created successfully');

    // Test password comparison
    const isMatch = await user.comparePassword('Password123');
    console.log('Password match:', isMatch);

    // Test login
    const foundUser = await User.findOne({ email: 'test@example.com' });
    if (foundUser) {
      const loginMatch = await foundUser.comparePassword('Password123');
      console.log('Login password match:', loginMatch);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testUserCreation();
