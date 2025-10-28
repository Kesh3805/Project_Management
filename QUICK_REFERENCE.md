# 📝 Quick Reference Guide

## 🚀 Essential Commands

### Installation
```powershell
# Install all dependencies at once
npm run install:all

# Or install separately
cd backend && npm install
cd frontend && npm install
```

### Development
```powershell
# Terminal 1 - Backend (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (Port 3000)
cd frontend
npm start
```

### Production
```powershell
# Backend
cd backend
npm start

# Frontend (build)
cd frontend
npm run build
```

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React App |
| Backend | http://localhost:5000 | API Server |
| API Docs | http://localhost:5000 | API Info |

## 📡 API Endpoints

```
GET    /api/tasks           - Get all tasks
GET    /api/tasks/:id       - Get one task
POST   /api/tasks           - Create task
PUT    /api/tasks/:id       - Update task
DELETE /api/tasks/:id       - Delete task
```

## 🧪 Quick API Tests

### Get All Tasks
```powershell
curl http://localhost:5000/api/tasks
```

### Create Task
```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"New Task\",\"description\":\"Test\",\"priority\":\"High\",\"dueDate\":\"2025-11-15\",\"assignee\":\"John\",\"status\":\"Pending\"}'
```

### Update Task Status
```powershell
curl -X PUT http://localhost:5000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{\"status\":\"Completed\"}'
```

### Delete Task
```powershell
curl -X DELETE http://localhost:5000/api/tasks/1
```

## 🎯 Git Workflow

### Initial Setup
```powershell
git init
git add .
git commit -m "feat: Initial project setup"
git branch dev
```

### Feature Development
```powershell
git checkout dev
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: Add my feature"
git push origin feature/my-feature
```

### Bug Fix
```powershell
git checkout dev
git checkout -b fix/bug-name
# ... fix bug ...
git add .
git commit -m "fix: Resolve bug description"
git push origin fix/bug-name
```

## 📦 Project Structure

```
Project_Management/
├── backend/           # Express API
├── frontend/          # React App
├── .github/           # CI/CD
└── *.md              # Documentation
```

## 🎨 Key Features

### Task Properties
- ✅ Title (required)
- ✅ Description (required)
- ✅ Priority: Low | Medium | High
- ✅ Due Date (YYYY-MM-DD)
- ✅ Assignee (required)
- ✅ Status: Pending | InProgress | Completed

### Filters
- Status filter
- Priority filter
- Sort by priority
- Sort by due date

## 🔧 Troubleshooting

### Port in Use
```powershell
# Change backend port in backend/.env
PORT=5001

# Update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

### Clear Cache
```powershell
npm cache clean --force
rm -rf node_modules
npm install
```

### CORS Error
Ensure backend is running before frontend.

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP.md | Setup instructions |
| GIT_SETUP.md | Git workflow |
| PROJECT_STRUCTURE.md | Architecture |
| BUILD_SUMMARY.md | Build details |
| QUICK_REFERENCE.md | This file |

## 🎯 Sample Task Data

```json
{
  "title": "Design Homepage",
  "description": "Create the main landing page UI",
  "priority": "High",
  "dueDate": "2025-11-05",
  "assignee": "John Doe",
  "status": "InProgress"
}
```

## ⚡ Quick Tips

1. Always start backend before frontend
2. Use dev branch for development
3. Commit often with meaningful messages
4. Test API before UI changes
5. Check responsive design on mobile

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port conflict | Change PORT in .env |
| CORS error | Start backend first |
| Module not found | Run npm install |
| Build fails | Clear cache, reinstall |

## 📞 Need Help?

1. Check documentation files
2. Review code comments
3. Test API endpoints
4. Verify both servers running
5. Check browser console

---

**Quick Start**: `npm run install:all` → Start backend → Start frontend → http://localhost:3000
