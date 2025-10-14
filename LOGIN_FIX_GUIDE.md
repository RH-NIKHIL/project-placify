# 🔐 LOGIN FIX - COMPLETE GUIDE

## ⚠️ PROBLEM
Backend server keeps stopping, preventing login from working.

## ✅ SOLUTION

### Method 1: Start Backend Manually (RECOMMENDED)

**Step 1: Open NEW Terminal**
- In VS Code: Terminal → New Terminal
- Or press: `Ctrl + Shift + ` (backtick)

**Step 2: Navigate to Backend**
```powershell
cd backend
```

**Step 3: Start Server**
```powershell
npm start
```

**Step 4: Keep This Terminal Open**
- DO NOT close this terminal
- You should see:
  ```
  🚀 Server running on port 5000
  📍 API available at http://localhost:5000
  ✅ MongoDB Connected Successfully
  ```

**Step 5: Open Application**
- Go to: http://localhost:5173
- Login with credentials below

---

### Method 2: Using CMD Window

**Step 1: Open File Explorer**
- Navigate to: `c:\project\new proj`

**Step 2: Double-Click**
- File: `START_BACKEND.bat`
- A black window will open and stay open

**Step 3: Keep Window Open**
- DO NOT close the CMD window
- Minimize it if needed

**Step 4: Open Application**
- Go to: http://localhost:5173
- Login works!

---

### Method 3: Using PowerShell (Alternative)

**Step 1: Open PowerShell**
- Press: `Win + X` → PowerShell

**Step 2: Navigate and Start**
```powershell
cd "c:\project\new proj\backend"
npm start
```

**Step 3: Keep PowerShell Open**
- Leave it running in background

---

## 🔑 LOGIN CREDENTIALS

### Admin Login
```
Email: admin@admin.com
Password: admin123
Dashboard: /admin-dashboard
```

### Company Login
```
Email: company@company.com
Password: company123
Dashboard: /company-dashboard
```

### User Login
```
Email: user@user.com
Password: user123
Dashboard: /user-dashboard
```

---

## 🚀 COMPLETE STARTUP PROCESS

### 1. Start MongoDB (if not running)
```powershell
# Check if running
Get-Process -Name "mongod" -ErrorAction SilentlyContinue

# If not running, start it
# (Your MongoDB installation path)
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### 2. Start Backend
```powershell
cd "c:\project\new proj\backend"
npm start
```
**✅ You should see:**
```
🚀 Server running on port 5000
📍 API available at http://localhost:5000
✅ MongoDB Connected Successfully
```

### 3. Start Frontend (if not running)
```powershell
cd "c:\project\new proj"
npm run dev
```
**✅ You should see:**
```
VITE v7.1.3  ready in 384 ms
➜  Local: http://localhost:5173/
```

### 4. Open Browser
- URL: http://localhost:5173
- Click quick login button or enter credentials
- Click "Sign In"

---

## ✅ VERIFICATION CHECKLIST

Before logging in, verify:

### Backend Running?
```powershell
netstat -ano | findstr ":5000"
```
**Should show:** TCP listening on port 5000

### Frontend Running?
```powershell
netstat -ano | findstr ":5173"
```
**Should show:** TCP listening on port 5173

### MongoDB Running?
```powershell
Get-Process -Name "mongod"
```
**Should show:** mongod process with ID

### Test Backend API
```powershell
curl http://localhost:5000
```
**Should return:** JSON with API info

---

## 🐛 TROUBLESHOOTING

### Problem: "Network Error" on Login
**Solution:**
1. Check backend is running: `netstat -ano | findstr ":5000"`
2. If not running, start backend in NEW terminal
3. Keep backend terminal open
4. Refresh browser

### Problem: Backend Keeps Stopping
**Solution:**
1. Close all VS Code terminals
2. Open ONE new terminal
3. Run: `cd backend && npm start`
4. DO NOT run any other commands in this terminal
5. Leave it open

### Problem: "Invalid Token" Error
**Solution:**
1. Clear browser localStorage
2. Press F12 → Console
3. Type: `localStorage.clear()`
4. Refresh page
5. Login again

### Problem: "Cannot Connect to MongoDB"
**Solution:**
1. Start MongoDB:
   ```powershell
   net start MongoDB
   ```
2. Or start manually from MongoDB installation folder
3. Verify with: `Get-Process -Name "mongod"`

### Problem: Port 5000 Already in Use
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr ":5000"

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Start backend again
cd backend
npm start
```

---

## 💡 IMPORTANT TIPS

### ✅ DO:
- Keep backend terminal open and running
- Start backend BEFORE attempting to login
- Use quick login buttons for faster access
- Check server status before reporting issues

### ❌ DON'T:
- Close backend terminal after starting
- Run multiple backend instances
- Modify .env file while server is running
- Clear browser cache if logged in

---

## 📊 CURRENT STATUS

```
MongoDB: ✅ Running (Port 27017)
Backend: ⚠️ Needs to be started manually
Frontend: ✅ Running (Port 5173)
```

---

## 🎯 QUICK START COMMANDS

**Complete Startup (Run in order):**

```powershell
# Terminal 1: Backend
cd "c:\project\new proj\backend"
npm start

# Terminal 2: Frontend (if needed)
cd "c:\project\new proj"
npm run dev

# Browser
# Open: http://localhost:5173
# Login: admin@admin.com / admin123
```

---

## ✅ SUCCESS INDICATORS

When everything works, you'll see:

**Backend Terminal:**
```
🚀 Server running on port 5000
📍 API available at http://localhost:5000
✅ MongoDB Connected Successfully
```

**Browser Console (F12):**
```
🔄 Attempting login to: http://localhost:5000/api/auth/login
✅ Login successful: {user: {...}, token: "..."}
```

**Dashboard Loads:**
- Admin → All users and companies visible
- Company → Posted jobs visible
- User → Profile and jobs visible

---

## 📞 EMERGENCY FIX

If nothing works:

1. **Kill All Node Processes**
```powershell
Get-Process node | Stop-Process -Force
```

2. **Restart MongoDB**
```powershell
net stop MongoDB
net start MongoDB
```

3. **Clear Everything**
```powershell
cd "c:\project\new proj"
rm -r node_modules
npm install
cd backend
rm -r node_modules
npm install
```

4. **Start Fresh**
```powershell
# Terminal 1
cd backend
npm start

# Terminal 2
npm run dev
```

---

**Last Updated:** October 14, 2025
**Status:** Backend needs manual start, then login works perfectly
