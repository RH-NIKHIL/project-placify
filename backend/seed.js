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

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 234 567 8900',
      college: 'MIT',
      department: 'Administration',
      score: 10000
    });
    console.log('✅ Admin created');

    // Create Users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'user@user.com',
        password: 'user123',
        role: 'user',
        phone: '+1 234 567 8901',
        college: 'MIT',
        department: 'Computer Science',
        skills: ['JavaScript', 'React', 'Node.js'],
        score: 9850,
        tasksCompleted: 45
      },
      {
        name: 'Alice Johnson',
        email: 'alice@alice.com',
        password: 'alice123',
        role: 'user',
        phone: '+1 234 567 8902',
        college: 'Stanford',
        department: 'Data Science',
        skills: ['Python', 'Machine Learning', 'TensorFlow'],
        score: 9720,
        tasksCompleted: 42
      },
      {
        name: 'Bob Smith',
        email: 'bob@bob.com',
        password: 'bob123',
        role: 'user',
        phone: '+1 234 567 8903',
        college: 'Harvard',
        department: 'Software Engineering',
        skills: ['Java', 'Spring Boot', 'Microservices'],
        score: 9650,
        tasksCompleted: 40
      }
    ]);
    console.log('✅ Users created');

    // Create Company User (for login)
    const companyUser = await User.create({
      name: 'Tech Company Inc.',
      email: 'company@company.com',
      password: 'company123',
      role: 'company',
      phone: '+1 234 567 8904',
      college: 'N/A',
      department: 'Business',
      score: 0
    });
    console.log('✅ Company User created');

    // Create Company
    const company = await Company.create({
      companyName: 'Tech Company Inc.',
      email: 'company@company.com',
      password: 'company123',
      industry: 'Technology',
      description: 'Leading technology solutions provider',
      website: 'https://techcompany.example.com',
      location: 'San Francisco, CA',
      phone: '+1 234 567 8904',
      totalEmployees: 156,
      activeProjects: 23,
      revenue: 45000,
      isVerified: true
    });
    console.log('✅ Company created');

    // Create Jobs
    const jobs = await Job.create([
      {
        title: 'Software Engineer',
        company: company._id,
        companyName: company.companyName,
        description: 'We are looking for a skilled Software Engineer to join our team.',
        requirements: ['3+ years experience', 'JavaScript expertise', 'React knowledge'],
        responsibilities: ['Develop new features', 'Code review', 'Mentor junior developers'],
        location: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Mid Level',
        salaryMin: 80000,
        salaryMax: 120000,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        isActive: true,
        postedBy: companyUser._id
      },
      {
        title: 'Data Scientist',
        company: company._id,
        companyName: company.companyName,
        description: 'Looking for a Data Scientist to analyze complex datasets.',
        requirements: ['Python proficiency', 'ML experience', 'Statistical analysis'],
        responsibilities: ['Data analysis', 'Model development', 'Report generation'],
        location: 'New York, NY',
        jobType: 'Full-time',
        experienceLevel: 'Senior Level',
        salaryMin: 100000,
        salaryMax: 150000,
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        isActive: true,
        postedBy: companyUser._id
      },
      {
        title: 'Frontend Developer',
        company: company._id,
        companyName: company.companyName,
        description: 'Join our team as a Frontend Developer.',
        requirements: ['React experience', 'CSS/HTML expertise', 'UI/UX understanding'],
        responsibilities: ['Build UI components', 'Optimize performance', 'Collaborate with designers'],
        location: 'Remote',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        salaryMin: 60000,
        salaryMax: 90000,
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        isActive: true,
        postedBy: companyUser._id
      },
      {
        title: 'DevOps Engineer',
        company: company._id,
        companyName: company.companyName,
        description: 'Seeking a DevOps Engineer to manage our infrastructure.',
        requirements: ['AWS experience', 'Docker/Kubernetes', 'CI/CD pipelines'],
        responsibilities: ['Manage infrastructure', 'Automate deployments', 'Monitor systems'],
        location: 'Seattle, WA',
        jobType: 'Full-time',
        experienceLevel: 'Mid Level',
        salaryMin: 90000,
        salaryMax: 130000,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
        isActive: true,
        postedBy: companyUser._id
      }
    ]);
    console.log('✅ Jobs created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@admin.com / admin123');
    console.log('User: user@user.com / user123');
    console.log('Company: company@company.com / company123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
