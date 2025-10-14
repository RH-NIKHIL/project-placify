# 🔐 LOGIN TROUBLESHOOTING GUIDE

## ✅ BOTH SERVERS ARE RUNNING!

### Current Status:
- ✅ Backend: http://localhost:5000 (RUNNING)
- ✅ MongoDB: Connected Successfully
- ✅ Frontend: http://localhost:5173 (RUNNING)
- ✅ Database has 7 users (verified)
- ✅ Password verification: WORKING

---

## 🔑 WORKING LOGIN CREDENTIALS

### Test Results: All passwords verified ✅

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | admin@admin.com | admin123 | ✅ VERIFIED |
| **User** | user@user.com | user123 | ✅ VERIFIED |
| **Company** | company@company.com | company123 | ✅ VERIFIED |

---

## 📋 STEP-BY-STEP LOGIN PROCESS

### Step 1: Open Frontend
Go to: **http://localhost:5173**

### Step 2: Navigate to Sign In
Click on "Sign In" or go directly to sign-in page

### Step 3: Enter Credentials
Try these tested credentials:

**For Admin Dashboard:**
```
Email: admin@admin.com
Password: admin123
```

**For User Dashboard:**
```
Email: user@user.com
Password: user123
```

**For Company Dashboard:**
```
Email: company@company.com
Password: company123
```

### Step 4: Click "Sign in" Button

### Step 5: Check Console (F12)
If login fails, open browser console (Press F12) and look for:
- 🔄 "Attempting login to: http://localhost:5000/api/auth/login"
- ✅ "Login successful: {...}"
- ❌ Any error messages

---

## 🔍 TROUBLESHOOTING CHECKLIST

### ✅ Backend is Running
```powershell
netstat -ano | findstr :5000
```
Should show: `LISTENING` on port 5000

If not running:
```bash
cd backend
node server.js
```

### ✅ Frontend is Running
```powershell
netstat -ano | findstr :5173
```
Should show: `LISTENING` on port 5173

If not running:
```bash
npm run dev
```

### ✅ MongoDB is Connected
Check backend console for:
```
✅ MongoDB Connected Successfully
```

### ✅ Browser Console is Clear
Open browser console (F12) and check for:
- No red error messages
- Green "Login successful" message when you try to login

---

## 🧪 TEST THE LOGIN API DIRECTLY

Open PowerShell and run:

### Test Admin Login:
```powershell
$body = @{email="admin@admin.com";password="admin123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@admin.com",
    "role": "admin"
  }
}
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Network error"
**Cause:** Backend server not running
**Solution:** 
```bash
cd backend
node server.js
```
Wait for: `✅ MongoDB Connected Successfully`

### Issue 2: "Invalid email or password"
**Cause:** Typing error or wrong credentials
**Solution:** 
- Copy-paste credentials from this guide
- Make sure no extra spaces
- Check Caps Lock is OFF

### Issue 3: "Request timeout"
**Cause:** MongoDB not connected
**Solution:**
- Check MongoDB service is running
- Check backend console for MongoDB connection message

### Issue 4: Login button not clickable
**Cause:** Form validation failing
**Solution:**
- Make sure email format is correct (has @ and .)
- Password must be at least 6 characters

### Issue 5: Page doesn't redirect after login
**Cause:** JavaScript error
**Solution:**
- Open browser console (F12)
- Look for red error messages
- Clear browser cache (Ctrl + Shift + Delete)
- Refresh page (F5)

---

## 🎯 WHAT HAPPENS AFTER SUCCESSFUL LOGIN

### For Admin (admin@admin.com):
→ Redirects to: `/admin-dashboard`
→ Can see: All users and companies

### For User (user@user.com):
→ Redirects to: `/user-dashboard`
→ Can see: Profile, jobs, leaderboard

### For Company (company@company.com):
→ Redirects to: `/company-dashboard`
→ Can see: Post jobs, manage jobs, view applicants

---

## 📊 DATABASE STATUS

```
Total Users: 7
├─ Admins: 1 (admin@admin.com)
├─ Regular Users: 5
└─ Companies: 1 (company@company.com)

Total Companies: 1
Total Jobs: 3
```

---

## 🆘 STILL CAN'T LOGIN?

### Method 1: Use Quick Start Script
Double-click `START_SERVERS.bat` to restart both servers

### Method 2: Manual Restart
**Terminal 1:**
```bash
cd backend
node server.js
```

**Terminal 2:**
```bash
npm run dev
```

### Method 3: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Try to login
4. Look for error messages (red text)
5. Copy the error and check what it says

### Method 4: Clear Browser Data
1. Press Ctrl + Shift + Delete
2. Clear "Cookies" and "Cached images and files"
3. Time range: "Last hour"
4. Click "Clear data"
5. Refresh page (F5)
6. Try login again

---

## ✅ VERIFICATION COMPLETE

Your system is ready:
- ✅ Backend server running
- ✅ MongoDB connected
- ✅ Frontend running
- ✅ All passwords verified working
- ✅ Users exist in database

**Everything is set up correctly. Login should work!**

---

## 📝 QUICK COPY-PASTE CREDENTIALS

**Admin:**
```
admin@admin.com
admin123
```

**User:**
```
user@user.com
user123
```

**Company:**
```
company@company.com
company123
```

---

**Last Verified:** October 14, 2025
**System Status:** ALL SYSTEMS OPERATIONAL ✅
