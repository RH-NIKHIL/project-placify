# Quick Setup Guide for MongoDB Backend

## Step 1: Install MongoDB

### Option A: Local MongoDB (Windows)
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start automatically as a service

### Option B: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get connection string
5. Update MONGODB_URI in backend/.env with your connection string

## Step 2: Install Backend Dependencies

Open PowerShell in the project root:

```powershell
cd backend
npm install
```

## Step 3: Start MongoDB (if using local)

MongoDB should start automatically. To check:

```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB
```

If not running:
```powershell
net start MongoDB
```

## Step 4: Seed Database with Sample Data

```powershell
npm run seed
```

This will create:
- Admin account: admin@example.com / admin123
- User account: user@example.com / user123
- Company account: company@example.com / company123
- Sample job postings

## Step 5: Start Backend Server

```powershell
npm start
```

Or for development (auto-restart on changes):
```powershell
npm run dev
```

Server will run at: http://localhost:5000

## Step 6: Test the API

Open your browser and go to:
http://localhost:5000

You should see:
```json
{
  "message": "User Management API Server",
  "version": "1.0.0",
  "status": "Running"
}
```

## Troubleshooting

### MongoDB Connection Error
- **Error**: "MongooseServerSelectionError"
- **Solution**: 
  - Make sure MongoDB is running
  - Check MONGODB_URI in .env file
  - For local: mongodb://localhost:27017/user-management
  - For Atlas: mongodb+srv://username:password@cluster.mongodb.net/...

### Port Already in Use
- **Error**: "EADDRINUSE: address already in use :::5000"
- **Solution**: 
  - Change PORT in .env to 5001 or another port
  - Or kill the process using port 5000:
    ```powershell
    netstat -ano | findstr :5000
    taskkill /PID <PID_NUMBER> /F
    ```

### Module Not Found
- **Error**: "Cannot find module 'express'"
- **Solution**: 
  ```powershell
  cd backend
  npm install
  ```

## Next Steps

1. ✅ Backend is running
2. Now connect your frontend to the backend
3. Update frontend to use API endpoints
4. Test login functionality

## API Testing

Use Postman or Thunder Client to test endpoints:

**Login Example:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user123"
}
```

You'll receive a JWT token to use for authenticated requests!
