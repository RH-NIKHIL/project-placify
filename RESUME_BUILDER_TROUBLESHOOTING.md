# 🔧 RESUME BUILDER - TROUBLESHOOTING & FIX GUIDE

## 🐛 Common Issues & Solutions

### Issue 1: "Resume Builder not loading"

**Symptoms:**
- Blank page when clicking Resume Generation
- Loading spinner forever
- No resumes showing

**Solutions:**

1. **Check if backend is running:**
```bash
# In terminal
netstat -ano | findstr ":5000"
```
Should show port 5000 listening.

2. **Check browser console (F12):**
   - Look for network errors
   - Check for 401 Unauthorized (not logged in)
   - Check for 500 Server Error

3. **Verify you're logged in:**
   - Check localStorage has token
   - Press F12 → Console
   - Type: `localStorage.getItem('authToken')`
   - Should return a token string

---

### Issue 2: "Cannot create resume"

**Symptoms:**
- Form doesn't submit
- Error message appears
- Resume not saved

**Solutions:**

1. **Fill required fields:**
   - Resume Name (required)
   - At least some personal info

2. **Check skills format:**
   - Enter comma-separated values
   - Example: `JavaScript, React, Node.js`
   - NO quotes, NO brackets

3. **Check backend connection:**
```javascript
// In browser console (F12)
fetch('http://localhost:5000/api/resumes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

---

### Issue 3: "Job matching not working"

**Symptoms:**
- Match button doesn't work
- No match results showing
- Score shows 0%

**Solutions:**

1. **Create a resume first:**
   - Must have at least one resume
   - Resume needs skills added

2. **Check if jobs exist:**
   - Go to Job Placement
   - Verify jobs are listed

3. **Add relevant skills:**
   - Match algorithm compares skills
   - Add skills that match job requirements

---

### Issue 4: "Resumes not displaying"

**Symptoms:**
- "My Resumes" tab is empty
- Created resume but don't see it
- List doesn't update

**Solutions:**

1. **Refresh the page:**
   - Press F5
   - Or click refresh button in Resume Builder

2. **Check database:**
```javascript
// Verify resume was created
fetch('http://localhost:5000/api/resumes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => r.json())
.then(d => console.log('Resumes:', d))
```

3. **Verify user ID:**
   - Resumes are user-specific
   - Must be logged in as same user

---

## ✅ STEP-BY-STEP: Create Your First Resume

### Prerequisites:
1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Logged in as USER

### Steps:

**1. Navigate to Resume Builder**
   - Login as: user@user.com / user123
   - Click: 📄 Resume Generation (sidebar)

**2. Click "Create Resume" Button**
   - Green button at top right
   - Modal form opens

**3. Fill in Resume Name (Required)**
```
Software Engineer Resume 2025
```

**4. Fill in Personal Information**
```
Name: Alex Johnson
Email: alex.johnson@email.com
Phone: +1 (555) 123-4567
Location: San Francisco, CA
LinkedIn: https://linkedin.com/in/alexjohnson
GitHub: https://github.com/alexjohnson
```

**5. Add Professional Summary**
```
Full-stack developer with 4+ years of experience building modern web applications.
Expert in React, Node.js, and cloud technologies. Passionate about creating 
scalable solutions and mentoring junior developers.
```

**6. Add Skills (Comma-Separated)**

**Technical Skills:**
```
JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Redux
```

**Tools:**
```
Git, Docker, Kubernetes, AWS, Jenkins, VS Code, Postman
```

**Soft Skills:**
```
Problem Solving, Team Leadership, Communication, Time Management
```

**7. Check "Set as primary resume" (Optional)**

**8. Click "Create Resume"**
   - Wait for success message
   - Resume appears in list

**9. Verify Resume Created**
   - Go to "My Resumes" tab
   - See your resume listed
   - Shows version number and stats

---

## 🎯 Test Job Matching

**1. Create Resume (if not done)**
   - Follow steps above

**2. Go to "Match with Jobs" Tab**

**3. Find a Job**
   - Look for jobs with similar skills

**4. Select Resume**
   - Click dropdown: "Match with Resume"
   - Choose your resume

**5. View Results**
   - Match score (0-100%)
   - Matched keywords (green)
   - Missing keywords (red)
   - Suggestions for improvement

---

## 🔍 Debug Mode

### Enable Detailed Logging:

Open browser console (F12) and paste:

```javascript
// Monitor all API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 API Call:', args[0]);
  return originalFetch.apply(this, arguments)
    .then(response => {
      console.log('✅ Response:', response.status, args[0]);
      return response;
    })
    .catch(error => {
      console.error('❌ Error:', error, args[0]);
      throw error;
    });
};

console.log('✅ Debug mode enabled!');
```

Now try creating a resume and watch the console.

---

## 🧪 Manual API Tests

### Test 1: Get All Resumes
```javascript
fetch('http://localhost:5000/api/resumes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Resumes:', d))
.catch(e => console.error('❌ Error:', e));
```

### Test 2: Create Resume
```javascript
fetch('http://localhost:5000/api/resumes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileName: 'Test Resume',
    content: {
      personalInfo: {
        name: 'Test User',
        email: 'test@test.com',
        phone: '555-1234'
      },
      summary: 'Test summary',
      skills: {
        technical: ['JavaScript', 'React'],
        soft: ['Communication'],
        tools: ['Git']
      }
    },
    isPrimary: false
  })
})
.then(r => r.json())
.then(d => console.log('✅ Created:', d))
.catch(e => console.error('❌ Error:', e));
```

### Test 3: Match Resume with Job
```javascript
// Replace RESUME_ID and JOB_ID with actual IDs
const resumeId = 'YOUR_RESUME_ID';
const jobId = 'YOUR_JOB_ID';

fetch(`http://localhost:5000/api/resumes/${resumeId}/match-job/${jobId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Match Result:', d))
.catch(e => console.error('❌ Error:', e));
```

---

## 🛠️ Common Fixes

### Fix 1: Clear Browser Cache
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```
Then login again.

### Fix 2: Reset Form State
If form is stuck, close and reopen:
1. Click X to close modal
2. Click "Create Resume" again
3. Form should be fresh

### Fix 3: Restart Backend
```bash
# In backend terminal
Ctrl + C  # Stop server
npm start # Start again
```

### Fix 4: Check MongoDB
```bash
# Verify MongoDB is running
Get-Process -Name "mongod"

# If not running, start it
net start MongoDB
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend is running (port 5000)
- [ ] Frontend is running (port 5173)
- [ ] MongoDB is running
- [ ] Logged in as USER role
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls succeeding
- [ ] Token exists in localStorage

---

## 📊 Expected Behavior

### Creating Resume:
1. Click "Create Resume"
2. Modal opens
3. Fill form fields
4. Click "Create Resume" button
5. Alert: "Resume created!"
6. Modal closes
7. Resume appears in list

### Matching with Job:
1. Go to "Match with Jobs" tab
2. See list of jobs
3. Click dropdown on a job
4. Select your resume
5. Alert shows match score
6. Match results appear below

### Editing Resume:
1. Find resume in "My Resumes"
2. Click "Edit" button
3. Modal opens with pre-filled data
4. Modify fields
5. Click "Update Resume"
6. Alert: "Resume updated!"
7. Changes reflected in list

---

## 🚨 If Nothing Works

**Complete Reset:**

1. **Stop all servers**
```bash
# Kill all node processes
Get-Process node | Stop-Process -Force
```

2. **Clear everything**
```bash
cd "c:\project\new proj"
rm -r node_modules -Force
npm install

cd backend
rm -r node_modules -Force
npm install
```

3. **Start fresh**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
npm run dev
```

4. **Clear browser**
   - Press F12
   - Console: `localStorage.clear()`
   - Refresh page

5. **Login and try again**

---

## 📞 Quick Diagnostic

Run this in browser console:

```javascript
console.log('🔍 RESUME BUILDER DIAGNOSTIC');
console.log('─'.repeat(50));
console.log('Token:', localStorage.getItem('authToken') ? '✅ Exists' : '❌ Missing');
console.log('User Role:', localStorage.getItem('userRole'));
console.log('User ID:', localStorage.getItem('userId'));
console.log('─'.repeat(50));

fetch('http://localhost:5000/api/resumes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(r => {
  console.log('Backend Status:', r.ok ? '✅ Connected' : '❌ Error');
  return r.json();
})
.then(d => {
  console.log('Resumes Found:', d.count || 0);
  console.log('─'.repeat(50));
})
.catch(e => {
  console.error('❌ Connection Failed:', e.message);
});
```

This will show you exactly what's wrong!

---

**Last Updated:** October 14, 2025
**Status:** Resume Builder functional, use this guide for troubleshooting
