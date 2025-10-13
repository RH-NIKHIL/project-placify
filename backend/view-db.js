const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const viewDatabase = async () => {
  try {
    console.log('\n📊 ============================================');
    console.log('   DATABASE: user-management');
    console.log('============================================\n');

    // Get Users
    const users = await User.find().select('-password');
    console.log(`👥 USERS (${users.length} total):`);
    console.log('============================================');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role.toUpperCase()}`);
      console.log(`   College: ${user.college}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Score: ${user.score}`);
      console.log(`   Tasks Completed: ${user.tasksCompleted}`);
      console.log(`   Skills: ${user.skills.join(', ') || 'None'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Get Companies
    const companies = await Company.find().select('-password');
    console.log(`\n\n🏢 COMPANIES (${companies.length} total):`);
    console.log('============================================');
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.companyName}`);
      console.log(`   Email: ${company.email}`);
      console.log(`   Industry: ${company.industry}`);
      console.log(`   Location: ${company.location}`);
      console.log(`   Website: ${company.website}`);
      console.log(`   Phone: ${company.phone}`);
      console.log(`   Employees: ${company.totalEmployees}`);
      console.log(`   Projects: ${company.activeProjects}`);
      console.log(`   Revenue: $${company.revenue}K`);
      console.log(`   Verified: ${company.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Created: ${company.createdAt}`);
    });

    // Get Jobs
    const jobs = await Job.find().populate('company', 'companyName');
    console.log(`\n\n💼 JOBS (${jobs.length} total):`);
    console.log('============================================');
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.companyName}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Type: ${job.jobType}`);
      console.log(`   Experience: ${job.experienceLevel}`);
      console.log(`   Salary: $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`);
      console.log(`   Skills: ${job.skills.join(', ')}`);
      console.log(`   Applications: ${job.applications.length}`);
      console.log(`   Active: ${job.isActive ? 'Yes' : 'No'}`);
      console.log(`   Posted: ${job.createdAt}`);
    });

    // Database Statistics
    console.log('\n\n📈 DATABASE STATISTICS:');
    console.log('============================================');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Companies: ${companies.length}`);
    console.log(`Total Jobs: ${jobs.length}`);
    console.log(`Active Jobs: ${jobs.filter(j => j.isActive).length}`);
    console.log(`Total Applications: ${jobs.reduce((sum, job) => sum + job.applications.length, 0)}`);
    
    const admins = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const companyUsers = users.filter(u => u.role === 'company').length;
    
    console.log(`\nUsers by Role:`);
    console.log(`  - Admins: ${admins}`);
    console.log(`  - Regular Users: ${regularUsers}`);
    console.log(`  - Companies: ${companyUsers}`);

    console.log('\n============================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing database:', error);
    process.exit(1);
  }
};

viewDatabase();
