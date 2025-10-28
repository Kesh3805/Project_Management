# 🚀 Quick Start Guide

## Get Started in 3 Steps!

### Step 1: Start the Backend
```powershell
cd C:\Users\user\Desktop\Project_Management\backend
node server.js
```

**Expected Output:**
```
🚀 Server is running on http://localhost:5000
✓ MongoDB Connected: localhost
✓ Database: project-management
```

### Step 2: Start the Frontend (Already Running!)
Your frontend is already running on **http://localhost:3000** ✅

### Step 3: Login and Start Using!
1. Open **http://localhost:3000** in your browser
2. Click **"Login with GitHub"**
3. Authorize the application
4. Start creating tasks with GitHub integration!

---

## 🎯 Key Features to Try

### 1. Create a Task with GitHub Integration
- Click "+ Add New Task"
- Fill in task details
- Scroll to "🔗 GitHub Integration"
- Select a repository and branch
- Task gets auto-generated ID (TASK-001)

### 2. View GitHub Activity
- Click "Show GitHub Activity" button
- Select a repository
- View commits and pull requests
- Switch between tabs

### 3. Link Commits to Tasks
```bash
git commit -m "TASK-001: Completed feature"
```

---

## 📁 File Structure Overview

```
Project_Management/
├── backend/                      # Node.js + Express + MongoDB
│   ├── models/                   # Database schemas
│   │   ├── User.js              # GitHub user data
│   │   └── TaskModel.js         # Tasks with GitHub fields
│   ├── routes/
│   │   ├── authRoutes.js        # Login/logout
│   │   ├── githubRoutes.js      # GitHub API
│   │   └── taskRoutes.js        # Task CRUD
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── passport.js          # OAuth setup
│   ├── services/
│   │   └── githubService.js     # GitHub API wrapper
│   └── server.js                # Main application
│
├── frontend/                     # React + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── Login.js         # GitHub OAuth login
│       │   ├── Header.js        # User profile + logout
│       │   ├── TaskForm.js      # Create/edit tasks
│       │   ├── TaskCard.js      # Task display
│       │   ├── TaskList.js      # Task grid
│       │   ├── FilterBar.js     # Filter controls
│       │   ├── RepositorySelector.js    # Repo/branch picker
│       │   └── GitHubActivityPanel.js   # Commits/PRs view
│       ├── context/
│       │   └── AuthContext.js   # Auth state management
│       ├── services/
│       │   └── api.js           # API client with auth
│       └── App.js               # Main component
│
└── docs/
    ├── MERN_UPGRADE.md          # Setup instructions
    ├── MERN_SUMMARY.md          # Feature overview
    └── UPDATE_SUMMARY.md        # Complete changelog
```

---

## 🔑 Environment Variables

Your `.env` is already configured with:
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/project-management
GITHUB_CLIENT_ID=Ov23liYW9HXLfNiS0W7T
GITHUB_CLIENT_SECRET=2199c09dec7e0a0db143d68c60f79982fb074507
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000
```

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎨 Component Hierarchy

```
App (with AuthProvider)
├── Login (if not authenticated)
└── AppContent (if authenticated)
    ├── Header
    │   ├── User Avatar
    │   ├── Username
    │   └── Logout Button
    ├── Add Task Button
    ├── GitHub Activity Toggle
    ├── TaskForm (conditional)
    │   └── RepositorySelector
    ├── FilterBar
    ├── GitHubActivityPanel (conditional)
    │   ├── Commits Tab
    │   └── Pull Requests Tab
    └── TaskList
        └── TaskCard (multiple)
```

---

## 🌐 API Endpoints Quick Reference

### Authentication
```
GET  /api/auth/github          → Redirect to GitHub OAuth
GET  /api/auth/github/callback → OAuth callback
GET  /api/auth/me              → Get current user (requires JWT)
POST /api/auth/logout          → Logout (requires JWT)
```

### Tasks (All require JWT)
```
GET    /api/tasks              → Get user's tasks
GET    /api/tasks/:id          → Get specific task
POST   /api/tasks              → Create new task
PUT    /api/tasks/:id          → Update task
DELETE /api/tasks/:id          → Delete task
```

### GitHub Integration (All require JWT)
```
GET    /api/github/repos                         → List repos
GET    /api/github/repos/:owner/:repo/commits    → Get commits
GET    /api/github/repos/:owner/:repo/pulls      → Get PRs
GET    /api/github/repos/:owner/:repo/branches   → Get branches
POST   /api/github/webhook                       → Webhook handler
```

---

## 🔐 Authentication Flow

```
User opens app
    ↓
Check localStorage for token
    ↓
    ├─ Token exists ─→ Fetch user data ─→ Show dashboard
    └─ No token ─────→ Show login page
                           ↓
                      Click "Login with GitHub"
                           ↓
                      Redirect to GitHub
                           ↓
                      User authorizes
                           ↓
                      Callback with token
                           ↓
                      Store in localStorage
                           ↓
                      Fetch user data
                           ↓
                      Show dashboard
```

---

## 🎯 Common Tasks

### Check if Backend is Running
```powershell
# Visit in browser:
http://localhost:5000

# Should see:
{
  "message": "Project Management API",
  "version": "2.0.0",
  "status": "running"
}
```

### Check if MongoDB is Connected
Look for this in backend terminal:
```
✓ MongoDB Connected: localhost
✓ Database: project-management
```

### Clear Authentication (Force Re-login)
Open browser console (F12):
```javascript
localStorage.clear()
location.reload()
```

### View Stored Token
Open browser console (F12):
```javascript
localStorage.getItem('token')
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Make sure MongoDB is running
net start MongoDB

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### Frontend shows 401 errors
```javascript
// Check if token exists (browser console)
localStorage.getItem('token')

// If no token, login again
```

### Can't see GitHub repos
- Make sure you're logged in
- Check backend terminal for errors
- Verify GitHub OAuth credentials in `.env`

---

## 📊 Database Structure

### Users Collection
```javascript
{
  _id: ObjectId("..."),
  githubId: "188580422",
  username: "Kesh3805",
  email: "kesh@example.com",
  avatar: "https://avatars.githubusercontent.com/...",
  accessToken: "gho_...",
  repos: [],
  lastLogin: ISODate("2025-10-28T..."),
  createdAt: ISODate("2025-10-28T..."),
  updatedAt: ISODate("2025-10-28T...")
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId("..."),
  taskId: "TASK-001",
  title: "Implement authentication",
  description: "Add GitHub OAuth",
  priority: "High",
  status: "Completed",
  dueDate: ISODate("2025-11-01T..."),
  assignee: "Kesh3805",
  repo: "my-repo",
  branch: "main",
  createdBy: ObjectId("..."),
  lastUpdatedBy: "Kesh3805",
  completedAt: ISODate("2025-10-28T..."),
  createdAt: ISODate("2025-10-28T..."),
  updatedAt: ISODate("2025-10-28T...")
}
```

---

## 🎉 You're All Set!

Everything is ready to use. Just make sure:
- ✅ MongoDB is running
- ✅ Backend is running on port 5000
- ✅ Frontend is running on port 3000
- ✅ You're logged in with GitHub

**Enjoy your new MERN stack Project Management Dashboard!** 🚀

---

*For detailed documentation, see:*
- `MERN_UPGRADE.md` - Setup guide
- `MERN_SUMMARY.md` - Features overview
- `UPDATE_SUMMARY.md` - Complete changelog
