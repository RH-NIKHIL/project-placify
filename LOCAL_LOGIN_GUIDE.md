# 🎯 LOCAL LOGIN SYSTEM - USER GUIDE

## ✅ What's Been Fixed

Your login system now has:
- **Simple & Clean UI** with quick login buttons
- **Proper Error Handling** with clear messages
- **Success Notifications** when login works
- **Local Authentication** connecting to your MongoDB database
- **Three Demo Accounts** ready to use

---

## 🚀 How to Start the Servers

### Option 1: Using Batch Files (RECOMMENDED)
1. Double-click `START_BACKEND.bat` - This opens Backend Server
2. Double-click `START_FRONTEND.bat` - This opens Frontend Server
3. Both windows will stay open and show server logs

### Option 2: Manual Start
**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 👤 Demo Accounts

### 1. Admin Account
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Access:** Admin Dashboard (view all users & companies)

### 2. Company Account  
- **Email:** `company@company.com`
- **Password:** `company123`
- **Access:** Company Dashboard (post jobs, view applicants)

### 3. User Account
- **Email:** `user@user.com`
- **Password:** `user123`
- **Access:** User Dashboard (view jobs, build resume, match jobs)

---

## 🎮 How to Login

### Method 1: Quick Login (One Click)
1. Open http://localhost:5173
2. Click one of the colored buttons:
   - 👑 **Purple Button** = Admin Login
   - 🏢 **Blue Button** = Company Login  
   - 👤 **Green Button** = User Login
3. Click "Sign In" button
4. You'll be redirected to your dashboard!

### Method 2: Manual Login
1. Type email and password manually
2. Click "Sign In"
3. Wait for success message
4. Auto-redirect to dashboard

---

## 🔧 Troubleshooting

### Problem: "Network error" or "Cannot connect"
**Solution:**
1. Check if Backend is running on port 5000
2. Check if MongoDB is running
3. Restart both servers using the batch files

### Problem: "Invalid email or password"
**Solution:**
1. Use exact demo credentials (case-sensitive)
2. Make sure backend is connected to database
3. Check backend terminal for error messages

### Problem: Servers keep stopping
**Solution:**
1. Use the batch files instead of VS Code terminal
2. Keep the batch file windows open
3. Don't close the terminal windows

---

## 📊 What Happens When You Login

1. **Frontend** sends email/password to Backend
2. **Backend** checks MongoDB database
3. **Backend** verifies password (encrypted with bcrypt)
4. **Backend** creates JWT token (7-day expiry)
5. **Frontend** stores token in localStorage
6. **Frontend** redirects to correct dashboard based on role
7. **Dashboard** loads with your user data

---

## 🗄️ Database Information

- **Database Name:** user-management
- **Collections:** users, companies, jobs, resumes
- **Connection:** mongodb://localhost:27017
- **Total Users:** 7 (1 admin, 5 users, 1 company)

---

## 🎨 Features of New Login Page

✅ Quick login buttons for demo accounts
✅ Real-time validation
✅ Loading spinner during login
✅ Success/error messages
✅ Auto-redirect based on role
✅ Clean modern UI
✅ Proper error handling
✅ Secure token storage

---

## 📱 After Login

### Admin Dashboard Shows:
- All registered users
- All companies
- User statistics

### Company Dashboard Shows:
- Posted jobs
- Job applications
- Company profile

### User Dashboard Shows:
- Profile information
- Available jobs
- Resume builder with job matching
- Leaderboard

---

## 🔐 Security Features

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Token expiry (7 days)
- Protected routes
- Secure localStorage

---

## 💡 Tips

1. **Keep both servers running** in their windows
2. **Use Quick Login buttons** for fast testing
3. **Check terminal output** if something doesn't work
4. **Clear browser cache** if you see old errors
5. **MongoDB must be running** for login to work

---

## 🆘 Still Having Issues?

1. Open browser console (F12) to see detailed errors
2. Check backend terminal for MongoDB connection status
3. Verify MongoDB is running: `Get-Process -Name mongod`
4. Test backend directly: Visit http://localhost:5000
5. Make sure both ports (5000 & 5173) are not blocked

---

**Last Updated:** October 14, 2025
**Status:** ✅ Fully Functional Local Login System
