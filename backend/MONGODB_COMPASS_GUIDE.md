# MongoDB Compass Connection Guide

## 📍 Connection String

```
mongodb://localhost:27017/user-management
```

## 🧭 How to Open in MongoDB Compass

### Step 1: Open MongoDB Compass

1. Search for "MongoDB Compass" in Windows Start Menu
2. Or download it from: https://www.mongodb.com/try/download/compass
3. Launch MongoDB Compass

### Step 2: Connect to Database

1. **When Compass opens, you'll see a connection screen**

2. **In the connection string field, paste:**
   ```
   mongodb://localhost:27017/user-management
   ```

3. **Or fill in manually:**
   - **Host:** `localhost`
   - **Port:** `27017`
   - **Authentication:** None (for local development)
   - **Database Name:** `user-management`

4. **Click "Connect"**

### Step 3: View Your Database

Once connected, you'll see:

```
📂 user-management (database)
   ├── 📊 users (collection) - 4 documents
   ├── 📊 companies (collection) - 1 document
   └── 📊 jobs (collection) - 4 documents
```

### Step 4: Explore Collections

**To view Users:**
1. Click on `user-management` database
2. Click on `users` collection
3. You'll see all 4 users (Admin, John, Alice, Bob)

**To view Companies:**
1. Click on `companies` collection
2. You'll see Tech Company Inc.

**To view Jobs:**
1. Click on `jobs` collection
2. You'll see 4 job postings

## 🔍 Useful MongoDB Compass Features

### View Documents
- Click any collection to see all documents
- Use "View" dropdown to switch between:
  - 📋 List View
  - 📊 JSON View
  - 📈 Table View

### Search/Filter
- Use the filter bar to search
- Example: `{ role: "user" }` to find all users
- Example: `{ isActive: true }` to find active items

### Edit Documents
- Click on a document
- Edit values directly
- Click "Update" to save

### Create New Documents
- Click "Add Data" button
- Choose "Insert Document"
- Add your JSON data

### Delete Documents
- Hover over a document
- Click the trash icon
- Confirm deletion

## 📊 Sample Queries to Try in Compass

### Find all users with role "user"
```json
{ "role": "user" }
```

### Find users with high scores
```json
{ "score": { "$gte": 9700 } }
```

### Find jobs with salary over $100k
```json
{ "salaryMin": { "$gte": 100000 } }
```

### Find active jobs
```json
{ "isActive": true }
```

## 🎯 Quick Navigation

**Database:** `user-management`

**Collections:**
1. **users** - All user accounts (admin, user, company roles)
2. **companies** - Company profiles
3. **jobs** - Job postings

**Connection Details:**
- Host: localhost
- Port: 27017
- No authentication required (local development)

## ⚠️ Troubleshooting

### Can't Connect to MongoDB?

**Check if MongoDB is running:**
```powershell
# In PowerShell
Get-Service -Name MongoDB
```

**If not running, start it:**
```powershell
net start MongoDB
```

### MongoDB Compass Not Installed?

Download from: https://www.mongodb.com/try/download/compass

Choose:
- **Platform:** Windows
- **Version:** Latest stable
- **Package:** .msi installer

### Connection Refused Error?

1. Make sure MongoDB service is running
2. Check if port 27017 is not blocked
3. Try connection string: `mongodb://127.0.0.1:27017/user-management`

## 💡 Pro Tips

1. **Favorite Your Connection**: Click the star icon to save connection for quick access

2. **Export Data**: Right-click collection → Export Collection (JSON/CSV)

3. **Import Data**: Collection → Add Data → Import File

4. **Schema Analysis**: Click "Schema" tab to see field types and distributions

5. **Performance Insights**: Use "Explain Plan" to analyze query performance

## 🔐 Security Note

Current setup is for **local development only** with no authentication.

For production:
- Enable MongoDB authentication
- Use strong passwords
- Restrict network access
- Use MongoDB Atlas for cloud hosting

## 📝 Current Database Contents

After seeding, you should see:

✅ **4 Users**
- 1 Admin (admin@example.com)
- 3 Regular Users (user@example.com, alice@example.com, bob@example.com)

✅ **1 Company**
- Tech Company Inc. (company@example.com)

✅ **4 Jobs**
- Software Engineer ($80K-$120K)
- Data Scientist ($100K-$150K)
- Frontend Developer ($60K-$90K)
- DevOps Engineer ($90K-$130K)

---

**Happy Exploring! 🎉**

Need help? Check MongoDB Compass documentation: https://docs.mongodb.com/compass/
