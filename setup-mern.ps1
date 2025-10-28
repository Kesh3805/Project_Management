# MERN Stack Setup and Run Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MERN Project Management Dashboard" -ForegroundColor Cyan
Write-Host "With GitHub OAuth Integration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoStatus = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoStatus) {
        if ($mongoStatus.Status -eq 'Running') {
            Write-Host "✓ MongoDB is running" -ForegroundColor Green
        } else {
            Write-Host "⚠ MongoDB is installed but not running" -ForegroundColor Yellow
            Write-Host "  Starting MongoDB..." -ForegroundColor Yellow
            Start-Service -Name MongoDB
            Write-Host "✓ MongoDB started" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ MongoDB is not installed locally" -ForegroundColor Red
        Write-Host "  Please install MongoDB or use MongoDB Atlas" -ForegroundColor Yellow
        Write-Host "  Download: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
        Write-Host ""
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit 1
        }
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Environment Setup Check" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check backend .env
$backendEnv = "backend\.env"
if (Test-Path $backendEnv) {
    $envContent = Get-Content $backendEnv -Raw
    
    Write-Host "Backend .env file found" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please configure these values:" -ForegroundColor Yellow
    Write-Host "  1. GITHUB_CLIENT_ID - from GitHub OAuth App" -ForegroundColor White
    Write-Host "  2. GITHUB_CLIENT_SECRET - from GitHub OAuth App" -ForegroundColor White
    Write-Host "  3. MONGODB_URI - MongoDB connection string" -ForegroundColor White
    Write-Host "  4. JWT_SECRET - Change to a secure random string" -ForegroundColor White
    Write-Host "  5. SESSION_SECRET - Change to a secure random string" -ForegroundColor White
    Write-Host ""
    
    if ($envContent -match "your-github-client-id") {
        Write-Host "✗ GitHub OAuth not configured yet!" -ForegroundColor Red
        Write-Host "  See MERN_UPGRADE.md for setup instructions" -ForegroundColor Yellow
    } else {
        Write-Host "✓ GitHub OAuth appears to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Backend .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Installation Options" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Install dependencies (Backend + Frontend)" -ForegroundColor White
Write-Host "2. Start MERN application" -ForegroundColor White
Write-Host "3. View setup documentation" -ForegroundColor White
Write-Host "4. Check MongoDB connection" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "Backend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "backend"
        npm install
        Set-Location -Path ".."
        
        Write-Host ""
        Write-Host "Frontend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "frontend"
        npm install
        Set-Location -Path ".."
        
        Write-Host ""
        Write-Host "✓ All dependencies installed!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "Starting MERN application..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This will open TWO terminal windows:" -ForegroundColor Cyan
        Write-Host "  1. Backend API (http://localhost:5000)" -ForegroundColor White
        Write-Host "  2. Frontend React App (http://localhost:3000)" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠ Make sure MongoDB is running!" -ForegroundColor Yellow
        Write-Host "⚠ Configure GitHub OAuth in .env first!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        # Start backend
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Starting MERN Backend...' -ForegroundColor Green; Write-Host 'MongoDB + GitHub OAuth + JWT Authentication' -ForegroundColor Cyan; npm run dev"
        
        Start-Sleep -Seconds 2
        
        # Start frontend
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Starting React Frontend...' -ForegroundColor Green; npm start"
        
        Write-Host ""
        Write-Host "✓ MERN application starting!" -ForegroundColor Green
        Write-Host ""
        Write-Host "URLs:" -ForegroundColor Cyan
        Write-Host "  Backend API: http://localhost:5000" -ForegroundColor White
        Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
        Write-Host "  Login: http://localhost:5000/api/auth/github" -ForegroundColor White
    }
    
    "3" {
        Write-Host ""
        Write-Host "Opening setup documentation..." -ForegroundColor Yellow
        
        if (Test-Path "MERN_UPGRADE.md") {
            Start-Process "MERN_UPGRADE.md"
            Write-Host "✓ Opened MERN_UPGRADE.md" -ForegroundColor Green
        } else {
            Write-Host "✗ MERN_UPGRADE.md not found" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
        Write-Host ""
        
        try {
            # Try to connect to MongoDB using mongosh (if available)
            $mongoTest = mongosh --eval "db.version()" --quiet 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ MongoDB is accessible" -ForegroundColor Green
                Write-Host "  Version: $mongoTest" -ForegroundColor Cyan
            } else {
                throw "Connection failed"
            }
        } catch {
            Write-Host "⚠ Could not connect with mongosh" -ForegroundColor Yellow
            Write-Host "  Trying alternative method..." -ForegroundColor Yellow
            
            # Try connecting via Node.js
            $testScript = @"
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log('✓ MongoDB connection successful'); process.exit(0); })
  .catch(err => { console.log('✗ MongoDB connection failed:', err.message); process.exit(1); });
"@
            $testScript | Out-File -FilePath "backend\test-mongo.js" -Encoding UTF8
            
            Set-Location -Path "backend"
            node test-mongo.js
            Remove-Item "test-mongo.js" -ErrorAction SilentlyContinue
            Set-Location -Path ".."
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create GitHub OAuth App:" -ForegroundColor White
Write-Host "   https://github.com/settings/developers" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Update backend\.env with:" -ForegroundColor White
Write-Host "   - GITHUB_CLIENT_ID" -ForegroundColor Cyan
Write-Host "   - GITHUB_CLIENT_SECRET" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Read MERN_UPGRADE.md for full setup guide" -ForegroundColor White
Write-Host ""
Write-Host "4. Start the application and login with GitHub!" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
