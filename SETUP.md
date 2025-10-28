# Project Management Dashboard - Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Start the Application

**Option A: Using two terminals (recommended for development)**

Terminal 1 (Backend):
```powershell
cd backend
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm start
```

**Option B: Using production mode**

Terminal 1 (Backend):
```powershell
cd backend
npm start
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm run build
# Then serve the build folder with a static server
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/

## Git Setup

### Initialize Repository

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: Initial project setup with backend and frontend"

# Create dev branch
git checkout -b dev

# Switch back to main
git checkout main
```

### Connect to GitHub

```powershell
# Add remote repository
git remote add origin <your-github-repo-url>

# Push to GitHub
git push -u origin main
git push -u origin dev
```

## Testing the API

You can test the API using curl or any API client like Postman:

### Get All Tasks
```powershell
curl http://localhost:5000/api/tasks
```

### Create a Task
```powershell
curl -X POST http://localhost:5000/api/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Test Task\",\"description\":\"Testing API\",\"priority\":\"High\",\"dueDate\":\"2025-11-15\",\"assignee\":\"Test User\",\"status\":\"Pending\"}'
```

### Update a Task
```powershell
curl -X PUT http://localhost:5000/api/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{\"status\":\"Completed\"}'
```

### Delete a Task
```powershell
curl -X DELETE http://localhost:5000/api/tasks/1
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change the port in `backend/.env`:
```
PORT=5001
```

2. Update the frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### npm install fails

Try clearing npm cache:
```powershell
npm cache clean --force
npm install
```

### CORS Issues

Make sure the backend server is running before starting the frontend.

## Next Steps

1. ✅ Install dependencies for both backend and frontend
2. ✅ Start both servers
3. ✅ Test the application in your browser
4. ✅ Initialize Git repository
5. ✅ Create GitHub repository and push code
6. ✅ Configure GitHub Actions (workflow file already created)

Enjoy managing your projects! 🚀
