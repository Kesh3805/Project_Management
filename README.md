# 📋 Project Management Dashboard

A responsive web application for managing project tasks with full CRUD operations, filtering capabilities, and GitHub integration.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Objective

Develop a responsive web application that allows users to manage project tasks efficiently. Users can create, view, update, delete, and filter tasks with different statuses (Pending, InProgress, Completed).

## ✨ Features

### Task Management
- ✅ **View all tasks** with complete details (Title, Description, Priority, Due Date, Assignee, Status)
- ✅ **Add new tasks** via an intuitive form
- ✅ **Edit/Update** task status and other details
- ✅ **Delete tasks** with confirmation
- ✅ **Visual indicators** for overdue tasks

### Filtering & Sorting
- 🔍 Filter tasks by:
  - All
  - Pending
  - InProgress
  - Completed
- 📊 Sort by:
  - Priority (High, Medium, Low)
  - Due Date

### Responsive Design
- 📱 Mobile-first design
- 💻 Tablet optimized
- 🖥️ Desktop ready
- 🎨 Built with Tailwind CSS

### RESTful API
Complete CRUD operations with the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/:id` | Retrieve a specific task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |

### GitHub Integration
- 🔄 Version control with Git
- 🌿 Branch management (main/dev)
- 🚀 GitHub Actions CI/CD pipeline
- 📝 Meaningful commit messages

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Scripts** - Build tooling

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Project_Management
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Backend `.env` file (already created):
```
PORT=5000
NODE_ENV=development
```

Frontend `.env` file (already created):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Creates optimized production build in /build folder
```

## 📊 API Documentation

### Task Object Schema

```json
{
  "id": 1,
  "title": "Design Homepage",
  "description": "Create the main landing page UI",
  "priority": "High",
  "dueDate": "2025-11-05",
  "assignee": "John Doe",
  "status": "InProgress"
}
```

### API Endpoints

#### Get All Tasks
```http
GET /api/tasks
```

**Query Parameters:**
- `status` (optional): Filter by status (Pending, InProgress, Completed)
- `priority` (optional): Filter by priority (Low, Medium, High)
- `sortBy` (optional): Sort by field (priority, dueDate)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

#### Get Task by ID
```http
GET /api/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "priority": "Medium",
  "dueDate": "2025-11-15",
  "assignee": "Jane Doe",
  "status": "Pending"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "Completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

## 🎨 UI Components

### Frontend Components Structure
```
src/
├── components/
│   ├── Header.js          # App header with branding
│   ├── TaskList.js        # Grid layout of tasks
│   ├── TaskCard.js        # Individual task card
│   ├── TaskForm.js        # Create/Edit task form
│   └── FilterBar.js       # Filter and sort controls
├── services/
│   └── api.js             # API service layer
├── App.js                 # Main app component
└── index.js               # App entry point
```

## 🔄 Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `dev` - Development branch
- `feature/*` - Feature branches

### Commit Message Convention
```
feat: Add new task creation feature
fix: Resolve task deletion bug
docs: Update API documentation
style: Format code with Prettier
refactor: Restructure task controller
test: Add unit tests for API
```

## 🚀 CI/CD Pipeline

GitHub Actions workflow includes:
- ✅ Backend testing and health checks
- ✅ Frontend build verification
- ✅ Code quality checks
- ✅ Automated testing on push/PR
- ✅ Multi-environment support (main/dev)

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ✅ Acceptance Criteria

- [x] User can add, edit, and delete tasks
- [x] Tasks are persisted (in-memory database)
- [x] API supports all CRUD operations
- [x] Task list can be filtered by status
- [x] App is responsive across devices
- [x] GitHub repo with version control
- [x] GitHub Actions pipeline configured

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Task comments and attachments
- [ ] Email notifications for due dates
- [ ] Drag-and-drop task reordering
- [ ] Dark mode support
- [ ] Export tasks to CSV/PDF
- [ ] Real-time updates with WebSockets
- [ ] Task templates
- [ ] Project grouping

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or suggestions, please open an issue in the GitHub repository.

---

**Made with ❤️ for efficient project management**
