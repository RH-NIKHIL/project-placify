# Backend Server for User Management System

This backend handles user authentication and data management for Admin, User, and Company roles using MongoDB.

## 📋 Features

- ✅ User Authentication (JWT)
- ✅ Role-based Access Control (Admin, User, Company)
- ✅ User Profile Management
- ✅ Company Management
- ✅ Job Posting System
- ✅ Job Application Tracking
- ✅ Leaderboard System
- ✅ MongoDB Database Integration

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

### 1. Install MongoDB

**Windows:**
- Download MongoDB from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
MONGODB_URI=mongodb://localhost:27017/user-management
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Seed Database (Optional)

Populate database with sample data:

```bash
node seed.js
```

### 5. Start Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

Server will run at: `http://localhost:5000`

## 🔑 Default Login Credentials (After Seeding)

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@example.com        | admin123    |
| User    | user@example.com         | user123     |
| Company | company@example.com      | company123  |

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint              | Description           | Access  |
|--------|-----------------------|-----------------------|---------|
| POST   | `/api/auth/register`  | Register new user     | Public  |
| POST   | `/api/auth/login`     | Login user            | Public  |
| GET    | `/api/auth/profile`   | Get user profile      | Private |

### Users (`/api/users`)

| Method | Endpoint                    | Description           | Access      |
|--------|-----------------------------|-----------------------|-------------|
| GET    | `/api/users`                | Get all users         | Admin       |
| GET    | `/api/users/:id`            | Get user by ID        | Private     |
| PUT    | `/api/users/:id`            | Update user profile   | Private     |
| DELETE | `/api/users/:id`            | Delete user           | Admin       |
| GET    | `/api/users/leaderboard/top`| Get leaderboard       | Public      |

### Companies (`/api/companies`)

| Method | Endpoint               | Description           | Access      |
|--------|------------------------|-----------------------|-------------|
| GET    | `/api/companies`       | Get all companies     | Public      |
| GET    | `/api/companies/:id`   | Get company by ID     | Public      |
| POST   | `/api/companies`       | Create company        | Public      |
| PUT    | `/api/companies/:id`   | Update company        | Private     |
| DELETE | `/api/companies/:id`   | Delete company        | Admin       |

### Jobs (`/api/jobs`)

| Method | Endpoint                             | Description              | Access      |
|--------|--------------------------------------|--------------------------|-------------|
| GET    | `/api/jobs`                          | Get all jobs             | Public      |
| GET    | `/api/jobs/:id`                      | Get job by ID            | Public      |
| POST   | `/api/jobs`                          | Create job posting       | Company     |
| PUT    | `/api/jobs/:id`                      | Update job               | Company     |
| DELETE | `/api/jobs/:id`                      | Delete job               | Company     |
| POST   | `/api/jobs/:id/apply`                | Apply for job            | User        |
| PUT    | `/api/jobs/:jobId/applications/:id`  | Update application status| Company     |

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin/company),
  phone: String,
  college: String,
  department: String,
  profilePicture: String,
  projects: Array,
  skills: Array,
  resume: String,
  tasksCompleted: Number,
  score: Number,
  isActive: Boolean,
  lastLogin: Date
}
```

### Company Model
```javascript
{
  companyName: String,
  email: String (unique),
  password: String (hashed),
  industry: String,
  description: String,
  website: String,
  location: String,
  phone: String,
  logo: String,
  totalEmployees: Number,
  activeProjects: Number,
  revenue: Number,
  employees: Array,
  jobPostings: Array,
  isVerified: Boolean,
  isActive: Boolean
}
```

### Job Model
```javascript
{
  title: String,
  company: ObjectId,
  companyName: String,
  description: String,
  requirements: Array,
  responsibilities: Array,
  location: String,
  jobType: String,
  experienceLevel: String,
  salaryMin: Number,
  salaryMax: Number,
  skills: Array,
  applications: Array,
  isActive: Boolean,
  deadline: Date,
  postedBy: ObjectId
}
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## 🧪 Testing API

Use tools like:
- **Postman**: https://www.postman.com/
- **Thunder Client** (VS Code Extension)
- **cURL** (Command line)

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For Windows: Check MongoDB service in Services

**Port Already in Use:**
- Change PORT in .env file
- Or kill process using port 5000

**Module Not Found:**
- Run `npm install` again
- Delete node_modules and package-lock.json, then reinstall

## 📝 Notes

- Change JWT_SECRET before production
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add input validation and sanitization
- Set up proper error logging
- Consider using MongoDB Atlas for production
