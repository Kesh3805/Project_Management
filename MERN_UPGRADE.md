# MERN Stack Upgrade - GitHub Integration Guide

## 🎉 Major Update: MERN Stack with GitHub OAuth

Your Project Management Dashboard has been upgraded to a full **MERN stack application** with complete GitHub integration!

## 🆕 New Features

### 1. **MongoDB Database**
- ✅ Persistent data storage
- ✅ User accounts with GitHub profiles
- ✅ Task-to-repository linking
- ✅ Automatic task ID generation

### 2. **GitHub OAuth Authentication**
- ✅ Login with GitHub account
- ✅ Secure JWT token-based sessions
- ✅ Automatic profile sync
- ✅ Access to user's repositories

### 3. **GitHub API Integration**
- ✅ View your GitHub repositories
- ✅ Connect repositories to projects
- ✅ Fetch recent commits
- ✅ View pull requests
- ✅ Browse branches
- ✅ Link tasks to specific branches

### 4. **GitHub Webhooks**
- ✅ Auto-update task status from commits
- ✅ Parse commit messages for task IDs
- ✅ Track who updated what via commits

## 📋 Prerequisites

### Install MongoDB

**Option 1: MongoDB Community Edition (Recommended)**

1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Compass (GUI) for easy database management
3. Start MongoDB service:
```powershell
# Start MongoDB
net start MongoDB
```

**Option 2: MongoDB Atlas (Cloud - Free Tier)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Project Management Dashboard
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy **Client ID** and **Client Secret**
6. Update `.env` file with these values

## 🔧 Configuration

### Backend Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB - LOCAL
MONGODB_URI=mongodb://localhost:27017/project-management

# MongoDB - ATLAS (Alternative)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# GitHub OAuth (Replace with your values)
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=your-session-secret-change-this-in-production
```

### Frontend Environment Variables (`.env`)

Update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id-here
```

## 🚀 Installation & Setup

### Step 1: Install New Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend (will need updates)
cd ..\frontend
npm install
```

### Step 2: Start MongoDB

```powershell
# If using local MongoDB
net start MongoDB

# Or start MongoDB Compass and connect to localhost:27017
```

### Step 3: Configure GitHub OAuth

1. Create OAuth app on GitHub (see above)
2. Update `.env` files with Client ID and Secret

### Step 4: Start the Application

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📡 New API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/github` | Login with GitHub | No |
| GET | `/api/auth/github/callback` | OAuth callback | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Tasks (All require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get user's tasks |
| GET | `/api/tasks/:id` | Get specific task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

Query parameters for filtering:
- `?status=Pending` - Filter by status
- `?priority=High` - Filter by priority
- `?repo=repo-name` - Filter by repository
- `?sortBy=priority` - Sort by priority/dueDate

### GitHub Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/github/repos` | Get user's repositories | Yes |
| POST | `/api/github/repos/connect` | Connect a repository | Yes |
| DELETE | `/api/github/repos/:repoId` | Disconnect repository | Yes |
| GET | `/api/github/repos/:owner/:repo/commits` | Get commits | Yes |
| GET | `/api/github/repos/:owner/:repo/pulls` | Get pull requests | Yes |
| GET | `/api/github/repos/:owner/:repo/branches` | Get branches | Yes |
| POST | `/api/github/webhook` | Webhook handler | No (GitHub) |

## 🔗 GitHub Webhook Setup

### Configure Webhook on GitHub

1. Go to your repository on GitHub
2. Settings → Webhooks → Add webhook
3. Configure:
   - **Payload URL**: `http://your-server-url/api/github/webhook`
   - **Content type**: `application/json`
   - **Events**: Select "Just the push event"
4. Save webhook

### Webhook Behavior

When you commit with a task ID in the message, the system auto-updates:

**Example commit messages:**
```bash
git commit -m "TASK-001: Completed login feature"
# Sets TASK-001 status to "Completed"

git commit -m "Working on TASK-002"
# Sets TASK-002 status to "InProgress"

git commit -m "TASK-003 done"
# Sets TASK-003 status to "Completed"
```

## 🎯 Task Schema (New Fields)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  priority: "Low" | "Medium" | "High",
  status: "Pending" | "InProgress" | "Completed",
  dueDate: Date,
  assignee: String,
  
  // NEW GitHub Integration Fields
  repo: String,              // Repository name
  repoId: Number,            // GitHub repository ID
  branch: String,            // Linked branch name
  taskId: String,            // Auto-generated (TASK-001)
  
  // User tracking
  createdBy: ObjectId,       // User reference
  lastUpdatedBy: String,     // Last person who updated
  completedAt: Date,         // When task was completed
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication Flow

### 1. User Login

```javascript
// Frontend: Redirect to GitHub
window.location.href = 'http://localhost:5000/api/auth/github';

// GitHub OAuth → Backend receives code
// Backend exchanges code for access token
// Backend creates/updates user in MongoDB
// Backend generates JWT token
// Frontend receives JWT and stores it
```

### 2. Making Authenticated Requests

```javascript
// Store token in localStorage
localStorage.setItem('token', data.token);

// Include in API requests
axios.get('/api/tasks', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## 📊 Sample API Usage

### Login with GitHub

```javascript
// Redirect to GitHub OAuth
window.location.href = 'http://localhost:5000/api/auth/github';

// After successful login, you'll receive:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "githubId": "123456",
    "username": "john-doe",
    "email": "john@example.com",
    "avatar": "https://avatars.githubusercontent.com/...",
    "repos": []
  }
}
```

### Create Task with Repository Link

```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{
    \"title\": \"Fix login bug\",
    \"description\": \"Resolve authentication issue\",
    \"priority\": \"High\",
    \"dueDate\": \"2025-11-15\",
    \"assignee\": \"John Doe\",
    \"status\": \"InProgress\",
    \"repo\": \"my-project\",
    \"branch\": \"feature/fix-login\"
  }'
```

### Get GitHub Commits

```powershell
curl http://localhost:5000/api/github/repos/owner/repo/commits?limit=5 `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Migration from Old Version

### Data Migration

The old in-memory tasks won't automatically transfer. To migrate:

1. Export tasks from old version (if needed)
2. Start new MERN version
3. Login with GitHub
4. Manually re-create important tasks OR
5. Use the import script (if provided)

### Frontend Updates Needed

The frontend will need updates to:
- ✅ Add GitHub login button
- ✅ Store and use JWT tokens
- ✅ Add repository selector
- ✅ Display GitHub activity feed
- ✅ Show task IDs (TASK-001, etc.)
- ✅ Add branch linking UI

## 🐛 Troubleshooting

### MongoDB Connection Error

```
✗ MongoDB Connection Error: connect ECONNREFUSED
```

**Solution**: Make sure MongoDB is running
```powershell
net start MongoDB
```

### GitHub OAuth Error

```
Error: GitHub OAuth failed
```

**Solution**: 
- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
- Verify callback URL matches GitHub OAuth app settings
- Make sure backend is running on correct port

### JWT Token Invalid

```
Not authorized, token failed
```

**Solution**:
- Token may have expired (7 days default)
- Login again to get new token
- Check `JWT_SECRET` is set in `.env`

## 📚 Next Steps

1. ✅ Install and configure MongoDB
2. ✅ Create GitHub OAuth app
3. ✅ Update environment variables
4. ✅ Install dependencies
5. ✅ Start the backend
6. ✅ Test login with GitHub
7. ⏭️ Update frontend for GitHub features
8. ⏭️ Set up GitHub webhooks
9. ⏭️ Deploy to production

## 🌟 Production Deployment

For production deployment:

1. Use MongoDB Atlas (cloud)
2. Update callback URLs to production domain
3. Enable HTTPS
4. Use strong secrets for JWT and sessions
5. Set up proper webhook URLs
6. Configure environment variables on hosting platform

---

**Congratulations! Your app is now a full MERN stack application with GitHub integration!** 🎉
