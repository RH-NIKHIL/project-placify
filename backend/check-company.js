const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/user-management')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const companyUsers = await User.find({ role: 'company' }).select('name email role');
    console.log('\n📊 Company Users:');
    console.log(JSON.stringify(companyUsers, null, 2));
    
    const allUsers = await User.find().select('name email role');
    console.log('\n📊 All Users:');
    console.log(JSON.stringify(allUsers, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
