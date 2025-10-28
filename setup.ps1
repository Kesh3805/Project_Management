# Project Management Dashboard - Development Setup Script
# This script helps you get started quickly

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Project Management Dashboard Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Node.js is installed
function Test-NodeInstalled {
    try {
        $nodeVersion = node --version
        Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
        Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
}

# Function to check if npm is installed
function Test-NpmInstalled {
    try {
        $npmVersion = npm --version
        Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ npm is not installed!" -ForegroundColor Red
        return $false
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$nodeInstalled = Test-NodeInstalled
$npmInstalled = Test-NpmInstalled

if (-not $nodeInstalled -or -not $npmInstalled) {
    Write-Host ""
    Write-Host "Please install the required software and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Installation Options" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Install all dependencies (Backend + Frontend)" -ForegroundColor White
Write-Host "2. Install Backend dependencies only" -ForegroundColor White
Write-Host "3. Install Frontend dependencies only" -ForegroundColor White
Write-Host "4. Start Development Servers" -ForegroundColor White
Write-Host "5. Initialize Git Repository" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Installing all dependencies..." -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "Installing Backend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "backend"
        npm install
        Set-Location -Path ".."
        
        Write-Host ""
        Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "frontend"
        npm install
        Set-Location -Path ".."
        
        Write-Host ""
        Write-Host "✓ All dependencies installed successfully!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "Installing Backend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "backend"
        npm install
        Set-Location -Path ".."
        Write-Host ""
        Write-Host "✓ Backend dependencies installed!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "frontend"
        npm install
        Set-Location -Path ".."
        Write-Host ""
        Write-Host "✓ Frontend dependencies installed!" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "Starting Development Servers..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This will open TWO terminal windows:" -ForegroundColor Cyan
        Write-Host "  1. Backend server (http://localhost:5000)" -ForegroundColor White
        Write-Host "  2. Frontend app (http://localhost:3000)" -ForegroundColor White
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        # Start backend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm run dev"
        
        # Wait a bit for backend to start
        Start-Sleep -Seconds 2
        
        # Start frontend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Starting Frontend App...' -ForegroundColor Green; npm start"
        
        Write-Host ""
        Write-Host "✓ Servers started!" -ForegroundColor Green
        Write-Host "  Backend: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    }
    
    "5" {
        Write-Host ""
        Write-Host "Initializing Git Repository..." -ForegroundColor Yellow
        
        if (Test-Path ".git") {
            Write-Host "Git repository already initialized!" -ForegroundColor Yellow
        }
        else {
            git init
            Write-Host "✓ Git initialized" -ForegroundColor Green
            
            git add .
            Write-Host "✓ Files staged" -ForegroundColor Green
            
            git commit -m "feat: Initial project setup - Simple Project Management Dashboard"
            Write-Host "✓ Initial commit created" -ForegroundColor Green
            
            git branch dev
            Write-Host "✓ Dev branch created" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "Git repository initialized successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Create a repository on GitHub" -ForegroundColor White
            Write-Host "2. Run: git remote add origin <your-repo-url>" -ForegroundColor White
            Write-Host "3. Run: git push -u origin main" -ForegroundColor White
            Write-Host "4. Run: git push -u origin dev" -ForegroundColor White
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start the development servers (if not already started)" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Check the documentation files for more information" -ForegroundColor White
Write-Host ""
Write-Host "Documentation Files:" -ForegroundColor Yellow
Write-Host "  - README.md - Project overview" -ForegroundColor White
Write-Host "  - SETUP.md - Setup instructions" -ForegroundColor White
Write-Host "  - QUICK_REFERENCE.md - Quick commands" -ForegroundColor White
Write-Host "  - GIT_SETUP.md - Git workflow guide" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
