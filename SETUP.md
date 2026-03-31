# 🚀 EcoSnap - Complete Setup Guide

Comprehensive step-by-step guide for setting up EcoSnap for development and production.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Python 3.9+ installed
- ✅ Node.js 16+ installed
- ✅ PostgreSQL 12+ installed and running
- ✅ Git installed
- ✅ At least 4GB RAM available
- ✅ 15GB free disk space

### Verify Installations
```bash
python3 --version      # Should be 3.9+
node --version         # Should be 16+
npm --version          # Should be 8+
psql --version         # Should be 12+
git --version
```

---

## 1️⃣ Initial Setup

### Clone Repository
```bash
git clone <repository-url>
cd EcoSnap
```

### One-Command Setup (Recommended)
```bash
npm run setup
```

This command:
- Installs root dependencies
- Creates backend venv
- Installs backend dependencies
- Installs frontend dependencies

---

## 2️⃣ Database Setup

### Create PostgreSQL Database

**macOS/Linux:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE ecosnap;
CREATE USER neil WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecosnap TO neil;
\q
```

**Windows (Command Prompt):**
```bash
psql -U postgres
CREATE DATABASE ecosnap;
CREATE USER neil WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecosnap TO neil;
\q
```

### Verify Connection
```bash
psql -h localhost -U neil -d ecosnap -c "SELECT version();"
```

---

## 3️⃣ Backend Setup

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Create Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

### Step 3: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your settings
# (Use your preferred editor: nano, vim, code, etc.)
nano .env
```

**Important .env settings:**
```env
DATABASE_URL=postgresql://neil:your_password@localhost:5432/ecosnap
BASE_URL=http://localhost:8000
SECRET_KEY=generate-a-random-key
DEBUG=True
```

### Step 5: Generate Secret Key
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste into `SECRET_KEY` in your `.env` file.

### Step 6: Initialize Database
```bash
# Create tables
python3 -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Tables created!')"
```

### Step 7: Download ML Models (First Time Only)
```bash
# YOLOv8 model will auto-download on first use
# Ensure keras_model.h5 is in app/ai_model/

# Check models exist
ls -la yolov8n.pt
ls -la app/ai_model/keras_model.h5
```

### Step 8: Start Backend Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 9: Verify Backend
```bash
# In another terminal, test health endpoint
curl http://127.0.0.1:8000/health
# Should return: {"status":"ok"}

# View API docs
# Open http://127.0.0.1:8000/docs in browser
```

---

## 4️⃣ Frontend Setup

### Step 1: Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit if needed (defaults should work for localhost)
# VITE_API_URL=http://localhost:8000
```

### Step 4: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v8.0.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser
Open http://localhost:5173 in your browser.

---

## 5️⃣ Verify Connection

### Check All Services Running

**Terminal 1 - Backend:**
```bash
curl http://127.0.0.1:8000/health
# Response: {"status":"ok"}
```

**Terminal 2 - Frontend:**
```bash
curl http://127.0.0.1:5173/ -I
# Response: HTTP/1.1 200 OK
```

### Test Registration
1. Open http://localhost:5173 in browser
2. Click "Register"
3. Fill in:
   - Email: test@example.com
   - Username: testuser
   - Password: testpass123
4. Click "Register"
5. Should redirect to Dashboard

### Test Login
1. Click "Logout" (if still logged in)
2. Click "Login"
3. Enter:
   - Username: testuser
   - Password: testpass123
4. Click "Login"
5. Should redirect to Dashboard

---

## 🔄 Running in Development

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Single Command
```bash
npm run dev
```

This will run both backend and frontend concurrently.

---

## 🏗️ Building for Production

### Backend Production Build
```bash
cd backend

# Install production dependencies
pip install gunicorn

# Run with production server
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Production Build
```bash
cd frontend

# Build
npm run build

# Preview build
npm run preview

# Output is in dist/ folder
# Deploy dist/ folder to hosting (Netlify, Vercel, AWS S3, etc.)
```

---

## 🐛 Troubleshooting

### Python Virtual Environment Issues

**Problem:** `source: command not found`
```bash
# Solution: Use bash instead of sh
bash
source venv/bin/activate
```

**Problem:** `venv not activated`
```bash
# Solution: Check prompt - should show (venv)
# If not, activate manually:
source venv/bin/activate
```

### PostgreSQL Connection Issues

**Problem:** `connection to server at "localhost" (127.0.0.1), port 5432 failed`
```bash
# Solution: Start PostgreSQL
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

**Problem:** `FATAL: role "neil" does not exist`
```bash
# Solution: Create the user
psql -U postgres
CREATE USER neil WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecosnap TO neil;
```

### Backend Connection Issues

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Activate venv and install deps
source venv/bin/activate
pip install -r requirements.txt
```

**Problem:** `Address already in use`
```bash
# Solution: Kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

### Frontend Build Issues

**Problem:** `Module not found: 'react'`
```bash
# Solution: Install dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** `Cannot find tsconfig.json`
```bash
# Solution: Already present, but verify
ls -la tsconfig.json
```

### ML Model Issues

**Problem:** `FileNotFoundError: yolov8n.pt not found`
```bash
# Solution: YOLOv8 will auto-download on first API call
# Or manually download:
python3 -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

**Problem:** `keras_model.h5 not found`
```bash
# Solution: Ensure model is in correct location
ls -la backend/app/ai_model/keras_model.h5

# If missing, check .gitignore or download from project source
```

---

## 🔐 Security Setup for Production

### 1. Update SECRET_KEY
```bash
# Generate strong secret
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Update .env
SECRET_KEY=your-generated-secret-key
```

### 2. Use HTTPS
```bash
# Install SSL certificate (Certbot)
sudo certbot certonly --standalone -d yourdomain.com

# Update BASE_URL
BASE_URL=https://yourdomain.com
```

### 3. Set DEBUG=False
```env
DEBUG=False
```

### 4. Update CORS Origins
```python
# In backend/app/main.py, change:
allow_origins=[
    "https://yourdomain.com",  # Your production domain
    "https://www.yourdomain.com"
]
```

### 5. Database Backups
```bash
# Backup database
pg_dump -U neil -d ecosnap > backup.sql

# Restore database
psql -U neil -d ecosnap < backup.sql
```

---

## 📊 Performance Optimization

### Backend
```bash
# Use multiple workers
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

# Use connection pooling
# In .env: DATABASE_URL with pool settings
```

### Frontend
```bash
# Enable gzip compression
# Configure in hosting provider

# Lazy load route components
# Already implemented in React Router
```

---

## 📚 Useful Commands

```bash
# Backend
cd backend && source venv/bin/activate
pip freeze                          # List all dependencies
pip install --upgrade -r requirements.txt  # Update deps
pytest                             # Run tests
python3 -m ipython                # Interactive shell

# Frontend
cd frontend
npm outdated                        # Check outdated packages
npm audit                          # Security audit
npm run lint                       # Run ESLint
npm run build                      # Production build

# Database
psql -U neil -d ecosnap            # Connect to DB
\dt                                # List tables
\d users                           # Describe users table
SELECT * FROM users;               # Query users
```

---

## 🚀 Deployment Checklist

- ✅ Test all features locally
- ✅ Run `npm run lint` and fix issues
- ✅ Update version numbers
- ✅ Create `.env` for production
- ✅ Set `DEBUG=False` in production
- ✅ Create database backups
- ✅ Review CORS origins
- ✅ Test with HTTPS
- ✅ Monitor logs after deployment
- ✅ Set up error tracking (Sentry, etc.)

---

## 📞 Support

- **API Documentation**: http://localhost:8000/docs (when running)
- **Issue Tracker**: GitHub Issues
- **Documentation**: README.md
- **Requirements**: REQUIREMENTS.md

---

**Last Updated**: March 31, 2026
**Version**: 2.0.0
- Open http://localhost:5173 in browser
- Go to Dashboard/HomePage
- Try uploading an image
- Check browser DevTools (F12 → Network tab) to see API requests

## ⚙️ Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env or .env file in backend/)
Already configured via `app/core/config.py` with defaults

## 🎯 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check backend status |
| `/report/analyze` | POST | Upload & analyze image |

## ❌ Troubleshooting

**"Failed to fetch from API"**
- Ensure backend is running on port 8000
- Check CORS origin in `backend/app/main.py`
- Verify frontend `.env` has correct API URL

**"Connection refused"**
- Backend not running
- Wrong port number
- Firewall blocking connection

**Database errors**
- PostgreSQL not running
- Invalid DATABASE_URL in backend `.env`
