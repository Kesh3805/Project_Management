# Git & GitHub Setup Guide

## Step 1: Initialize Local Git Repository

Open PowerShell in the Project_Management directory and run:

```powershell
# Initialize git repository
git init

# Configure git (if not already configured)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files to staging
git add .

# Create initial commit
git commit -m "feat: Initial project setup - Simple Project Management Dashboard

- Created Express.js backend with RESTful API
- Implemented complete CRUD operations for tasks
- Built React frontend with Tailwind CSS
- Added responsive task management UI
- Configured GitHub Actions CI/CD pipeline
- Added comprehensive documentation"

# Create development branch
git checkout -b dev
git checkout main
```

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: project-management-dashboard
   - **Description**: Simple Project Management Dashboard with React and Express
   - **Visibility**: Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

Copy the commands from GitHub (they'll look similar to this):

```powershell
# Add remote repository
git remote add origin https://github.com/yourusername/project-management-dashboard.git

# Verify remote was added
git remote -v

# Push main branch
git push -u origin main

# Push dev branch
git push -u origin dev
```

## Step 4: Verify GitHub Actions

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. You should see the CI/CD workflow ready to run
4. Make a small change and push to trigger the workflow:

```powershell
# Make a change (example)
git checkout dev
echo "# Development Branch" >> dev-notes.txt
git add dev-notes.txt
git commit -m "docs: Add development notes"
git push origin dev
```

## Step 5: Branch Protection (Optional but Recommended)

1. Go to repository Settings
2. Click "Branches" in the left sidebar
3. Click "Add rule" under Branch protection rules
4. Set branch name pattern: `main`
5. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
6. Save changes

## Recommended Git Workflow

### Feature Development

```powershell
# Start from dev branch
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/add-task-priority-filter

# Make changes and commit
git add .
git commit -m "feat: Add priority filter to task list"

# Push feature branch
git push origin feature/add-task-priority-filter

# Create Pull Request on GitHub to merge into dev
```

### Bug Fixes

```powershell
# Start from dev branch
git checkout dev
git pull origin dev

# Create bugfix branch
git checkout -b fix/task-deletion-error

# Make changes and commit
git add .
git commit -m "fix: Resolve task deletion confirmation bug"

# Push and create PR
git push origin fix/task-deletion-error
```

### Release to Production

```powershell
# Merge dev into main when ready for release
git checkout main
git pull origin main
git merge dev
git push origin main
```

## Commit Message Convention

Follow this format for clear commit history:

### Format
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code styling (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: Add task search functionality

Implemented real-time search that filters tasks by title and description.
Users can now quickly find specific tasks.

Closes #42
```

```bash
fix: Resolve task status update bug

Fixed an issue where task status wasn't updating in the UI after API call.
Added proper state refresh after status change.
```

```bash
docs: Update API documentation with new endpoints
```

## Useful Git Commands

```powershell
# Check status
git status

# View commit history
git log --oneline

# View changes
git diff

# Undo changes (not staged)
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Create and switch to new branch
git checkout -b <branch-name>

# Switch branches
git checkout <branch-name>

# List all branches
git branch -a

# Delete branch
git branch -d <branch-name>

# Pull latest changes
git pull origin <branch-name>

# Stash changes
git stash
git stash pop

# View remote repositories
git remote -v
```

## GitHub Actions Triggers

The CI/CD pipeline runs automatically on:

- Push to `main` branch
- Push to `dev` branch
- Pull requests to `main` or `dev`

### What the Pipeline Does

1. **Backend CI**
   - Installs dependencies
   - Runs tests
   - Checks if server starts

2. **Frontend CI**
   - Installs dependencies
   - Runs tests
   - Builds production bundle

3. **Code Quality**
   - Runs linting checks
   - Validates code style

## Next Steps

1. ✅ Initialize git repository locally
2. ✅ Create GitHub repository
3. ✅ Push code to GitHub
4. ✅ Verify GitHub Actions workflow
5. ✅ Set up branch protection
6. ✅ Start developing with proper git workflow

---

**Happy coding! 🚀**
