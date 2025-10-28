# Deployment Guide

## Overview

This guide covers various deployment options for your Project Management Dashboard.

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   ```
   Name: project-management-api
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., https://project-management-api.onrender.com)

#### Deploy Frontend to Vercel

1. **Create a Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-render-url.onrender.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at https://your-app.vercel.app

### Option 2: Heroku (Full Stack)

#### Prerequisites
```powershell
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### Deploy Backend

1. **Create Heroku App**
```powershell
cd backend
heroku login
heroku create project-management-api
```

2. **Add Procfile**
Create `backend/Procfile`:
```
web: node server.js
```

3. **Set Environment Variables**
```powershell
heroku config:set NODE_ENV=production
```

4. **Deploy**
```powershell
git add .
git commit -m "deploy: Configure for Heroku"
git push heroku main
```

5. **Open App**
```powershell
heroku open
```

#### Deploy Frontend

1. **Update API URL**
Edit `frontend/.env`:
```
REACT_APP_API_URL=https://project-management-api.herokuapp.com/api
```

2. **Create Heroku App**
```powershell
cd frontend
heroku create project-management-ui
```

3. **Add Buildpack**
```powershell
heroku buildpacks:set mars/create-react-app
```

4. **Deploy**
```powershell
git add .
git commit -m "deploy: Configure frontend for Heroku"
git push heroku main
```

### Option 3: Netlify (Frontend) + Railway (Backend)

#### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select root directory: `backend`

3. **Configure**
   - Railway will auto-detect Node.js
   - Add environment variables in Settings

4. **Deploy**
   - Railway will automatically deploy
   - Copy the provided URL

#### Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository

3. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

4. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add: `REACT_APP_API_URL=https://your-railway-url.up.railway.app/api`

5. **Deploy**
   - Click "Deploy site"
   - Your site will be live at https://your-app.netlify.app

### Option 4: AWS (Advanced)

#### Backend on AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu Server
   - t2.micro (free tier)
   - Configure security group (allow HTTP, HTTPS, SSH)

2. **Connect and Setup**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pm2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd project-management/backend
npm install

# Start with pm2
pm2 start server.js --name "api"
pm2 save
pm2 startup
```

3. **Configure Nginx (optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Frontend on AWS S3 + CloudFront

1. **Build Frontend**
```powershell
cd frontend
npm run build
```

2. **Create S3 Bucket**
   - Go to AWS S3
   - Create bucket
   - Enable static website hosting

3. **Upload Build**
   - Upload contents of `build/` folder
   - Set permissions to public

4. **Configure CloudFront**
   - Create distribution
   - Set origin to S3 bucket
   - Configure for React Router (custom error pages)

### Option 5: Docker (Any Platform)

#### Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### Deploy
```powershell
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔒 Production Checklist

### Backend
- [ ] Set NODE_ENV=production
- [ ] Use proper database (MongoDB/PostgreSQL)
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Enable HTTPS
- [ ] Add logging (Winston, Morgan)
- [ ] Set up monitoring
- [ ] Configure CORS properly
- [ ] Add input validation
- [ ] Implement error tracking (Sentry)

### Frontend
- [ ] Build with production flag
- [ ] Minify and compress assets
- [ ] Enable HTTPS
- [ ] Update API URL
- [ ] Add analytics (Google Analytics)
- [ ] Configure CDN
- [ ] Add error boundaries
- [ ] Optimize images
- [ ] Add service worker (PWA)
- [ ] Test on multiple devices

### Security
- [ ] Use environment variables
- [ ] Never commit .env files
- [ ] Implement HTTPS
- [ ] Add security headers
- [ ] Sanitize user inputs
- [ ] Use CORS properly
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Regular dependency updates
- [ ] Security audits

## 🔍 Monitoring

### Backend Monitoring
- Use PM2 for process management
- Set up application logging
- Monitor API response times
- Track error rates
- Monitor server resources

### Frontend Monitoring
- Google Analytics or similar
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics

## 📊 CI/CD with GitHub Actions

The included GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:
- Tests backend on push
- Builds frontend on push
- Runs code quality checks

### Add Deployment to CI/CD

Add to `.github/workflows/ci-cd.yml`:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [backend, frontend, lint]
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🌐 Custom Domain

### Vercel
1. Go to project settings
2. Add custom domain
3. Update DNS records

### Netlify
1. Go to domain settings
2. Add custom domain
3. Configure DNS

### Render
1. Go to settings
2. Add custom domain
3. Update DNS with CNAME

## 📝 Environment Variables

### Production Environment Variables

**Backend**:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your-database-url
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend**:
```
REACT_APP_API_URL=https://your-api-url.com/api
REACT_APP_ENV=production
```

## 🚨 Troubleshooting

### Build Fails
- Check Node.js version
- Clear build cache
- Verify all dependencies
- Check environment variables

### CORS Errors
- Update CORS_ORIGIN in backend
- Verify API URL in frontend
- Check HTTPS/HTTP mismatch

### API Not Responding
- Check server logs
- Verify environment variables
- Check firewall rules
- Verify deployment succeeded

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Netlify Docs](https://docs.netlify.com/)
- [AWS Docs](https://docs.aws.amazon.com/)
- [Docker Docs](https://docs.docker.com/)

---

**Choose the deployment option that best fits your needs!** 🚀
