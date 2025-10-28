# Project Structure

```
Project_Management/
│
├── backend/                      # Express.js Backend
│   ├── controllers/
│   │   └── taskController.js    # Business logic for tasks
│   ├── models/
│   │   └── Task.js              # Task model/schema
│   ├── routes/
│   │   └── taskRoutes.js        # API route definitions
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server setup
│   └── package.json             # Backend dependencies
│
├── frontend/                     # React Frontend
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js        # App header
│   │   │   ├── TaskList.js      # Task grid container
│   │   │   ├── TaskCard.js      # Individual task display
│   │   │   ├── TaskForm.js      # Create/Edit form
│   │   │   └── FilterBar.js     # Filter controls
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Main component
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   ├── .env                     # Frontend env variables
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── package.json             # Frontend dependencies
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions workflow
│
├── .gitignore                   # Git ignore rules
├── README.md                    # Project documentation
├── SETUP.md                     # Setup instructions
└── package.json                 # Root package scripts
```

## Architecture Overview

### Backend Architecture
```
Client Request
    ↓
Express Server (server.js)
    ↓
Routes (taskRoutes.js)
    ↓
Controllers (taskController.js)
    ↓
Models (Task.js)
    ↓
In-Memory Database
    ↓
Response
```

### Frontend Architecture
```
Browser
    ↓
React App (App.js)
    ↓
Components (Header, TaskList, TaskCard, TaskForm, FilterBar)
    ↓
API Service (api.js)
    ↓
Backend API
```

## Data Flow

1. **Create Task**
   - User fills TaskForm → Submit → api.createTask() → POST /api/tasks → Controller validates → Task created → Response → UI updates

2. **Update Task**
   - User clicks Edit → TaskForm populated → Submit → api.updateTask() → PUT /api/tasks/:id → Task updated → UI refreshes

3. **Delete Task**
   - User clicks Delete → Confirmation → api.deleteTask() → DELETE /api/tasks/:id → Task removed → UI refreshes

4. **Filter Tasks**
   - User selects filter → FilterBar updates state → App.js applies filters → Filtered tasks displayed

## Key Features Implementation

### Responsive Design
- Tailwind CSS utility classes
- Mobile-first approach
- Grid layout for task cards
- Responsive navigation

### State Management
- React Hooks (useState, useEffect)
- Local state in App.js
- Props passed to child components

### API Communication
- Axios for HTTP requests
- Error handling
- Loading states
- Environment-based URLs

### Data Persistence
- In-memory storage (tasks array)
- Ready for database integration
- CRUD operations fully implemented
