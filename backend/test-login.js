const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/user-management')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const email = 'admin@admin.com';
    const password = 'admin123';
    
    console.log(`Testing login for: ${email}`);
    console.log(`Password: ${password}\n`);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...\n`);
    
    // Test password
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password is CORRECT! Login should work.');
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('\nTrying to rehash and save...');
      user.password = password;
      await user.save();
      console.log('✅ Password has been reset. Try logging in again.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
