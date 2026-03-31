# 🔧 EcoSnap - Troubleshooting Guide

Common issues and their solutions.

---

## 🚨 Common Issues

### Backend Issues

#### 1. PostgreSQL Connection Failed

**Error**: 
```
FATAL: role 'postgres' does not exist
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL: role 'postgres' does not exist
```

**Causes**:
- Trying to connect with wrong database user
- PostgreSQL not running
- Wrong credentials in `.env`

**Solutions**:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# List database users
sudo -u postgres psql -c "\du"

# Create database user if needed
sudo -u postgres createdb ecosnap
sudo -u postgres createuser neil
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecosnap TO neil;"

# Update .env with correct credentials
# DATABASE_URL=postgresql://neil@localhost/ecosnap
```

#### 2. Port Already in Use

**Error**:
```
Address already in use
Uvicorn is running on port 8000 already
```

**Solutions**:

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

#### 3. Module Not Found Errors

**Error**:
```
ModuleNotFoundError: No module named 'fastapi'
ModuleNotFoundError: No module named 'sqlalchemy'
```

**Solutions**:

```bash
# Check if virtual environment is activated
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install missing package
pip install fastapi

# Install all requirements
pip install -r requirements.txt

# Check installed packages
pip list
```

#### 4. Model Loading Fails

**Error**:
```
Failed to load YOLOv8 model
Error loading Keras model
```

**Solutions**:

```bash
# Ensure ML models are downloaded
cd backend/app/ai_model/

# Manual download (if needed)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt

# Check file permissions
ls -la *.pt
ls -la *.h5

# Free up disk space
df -h

# Check if files exist
python -c "from ultralytics import YOLO; model = YOLO('yolov8n.pt')"
```

#### 5. Timezone Issues

**Error**:
```
ValueError: tzinfo is required for timezone-aware datetime
```

**Solutions**:

```python
# In app/core/config.py, use UTC times
from datetime import datetime, timezone

now = datetime.now(timezone.utc)
```

---

### Frontend Issues

#### 1. API Connection Refused

**Error**:
```
Failed to fetch
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solutions**:

```typescript
// Check API URL in .env
// VITE_API_URL=http://localhost:8000

// Verify in frontend/src/services/api.ts
console.log('API Base URL:', import.meta.env.VITE_API_URL);

// Ensure backend is running
curl http://localhost:8000/health

// Check CORS configuration in backend
# app/main.py should have:
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     ...
# )
```

#### 2. Blank Page After Login

**Error**: 
```
Blank white page, no errors in console
```

**Solutions**:

```bash
# Check browser console for errors (F12)

# Verify React component renders
# src/pages/Dashboard.tsx

# Check if useAuth hook is properly implemented
# src/context/AuthContext.tsx

# Verify AuthProvider wraps app
# src/main.tsx

# Clear cache and hard refresh
# Ctrl+Shift+R (Cmd+Shift+R on Mac)

# Check in browser DevTools:
# - Storage -> localStorage -> token exists?
# - Network tab -> API responses?
# - Console -> Any errors?
```

#### 3. Build Fails

**Error**:
```
npm run build fails
TypeScript compilation errors
```

**Solutions**:

```bash
# Check Node version (should be 16+)
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# View full error
npm run build 2>&1 | more

# Fix common issues
# - Missing types: npm install --save-dev @types/package-name
# - Import errors: Check file paths (case-sensitive on Linux/Mac)
# - Module not found: npm install missing-package
```

#### 4. Image Upload Not Working

**Error**:
```
Upload fails silently or with 413 error
```

**Solutions**:

```bash
# 413 = Request entity too large
# Increase Nginx limit (if using Nginx):
# client_max_body_size 100M;

# Increase FastAPI limit:
# In backend/app/main.py:
# app.add_middleware(
#     GZipMiddleware, minimum_size=1000)

# Check file size limits
# Frontend: Check form validation
# Backend: Check request body size

# Verify upload directory exists
ls -la backend/app/static/uploads/
chmod 755 backend/app/static/uploads/
```

#### 5. TypeScript Errors

**Error**:
```
"ReactNode" is a type and must be imported using a type-only import
Receive: TS1371
```

**Solutions**:

```typescript
// Wrong:
import { ReactNode } from 'react';

// Correct:
import type { ReactNode } from 'react';

// Check tsconfig.json for verbatimModuleSyntax setting
// If enabled (true), all types must use 'type' keyword

// For multiple imports:
import type { ReactNode, FC } from 'react';
import { useState } from 'react';
```

---

### Database Issues

#### 1. PostgreSQL Won't Start

**Error**:
```
pg_ctl: could not start server
postgres: error while loading shared libraries
```

**Solutions**:

```bash
# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log

# Check if data directory exists
ls -la /var/lib/postgresql/*/main

# Reinitialize database cluster
sudo -u postgres /usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/*/main

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 2. Database Locked

**Error**:
```
Database is locked
Cannot acquire lock
```

**Solutions**:

```bash
# List active connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='ecosnap';"

# Terminate specific connection
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='ecosnap' AND pid <> pg_backend_pid();

# Use transaction timeout (in app)
from sqlalchemy import event
session.execute("SET statement_timeout TO '30s'")
```

#### 3. Slow Queries

**Error**:
```
API responses taking >5 seconds
```

**Solutions**:

```sql
-- Enable query logging
ALTER DATABASE ecosnap SET log_statement = 'all';
ALTER DATABASE ecosnap SET log_duration = 'on';
ALTER DATABASE ecosnap SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Find slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Add indexes
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_users_email ON users(email);
```

---

### Environment & Configuration

#### 1. Environment Variable Not Loaded

**Error**:
```
KeyError: 'DATABASE_URL'
os.environ['SECRET_KEY'] throws KeyError
```

**Solutions**:

```bash
# Check .env file exists
ls -la backend/.env
ls -la frontend/.env

# Check .env has correct format
# DATABASE_URL=postgresql://user:password@localhost/database
# (No quotes around values)

# Load variables manually
export $(cat backend/.env | grep -v '#' | xargs)

# In Python, use python-dotenv
from dotenv import load_dotenv
load_dotenv()

# In frontend (Vite), use VITE_ prefix
# VITE_API_URL=http://localhost:8000
```

#### 2. .gitignore Not Working

**Error**:
```
.env file committed to repository
secrets exposed
```

**Solutions**:

```bash
# Remove cached files
git rm -r --cached .

# Re-add files
git add -A

# Verify .env in .gitignore
cat .gitignore | grep -E "\.env|\.env\."

# Add to .gitignore if missing
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

### Authentication Issues

#### 1. Login Returns 401 Unauthorized

**Error**:
```
Invalid credentials
User not found
```

**Solutions**:

```bash
# Check if user exists in database
psql -U neil -d ecosnap
SELECT * FROM users WHERE username='testuser';

# Verify password is hashed (not plaintext)
SELECT * FROM users WHERE id=1;
# hashed_password should be long bcrypt string

# Test password verification
python -c "
from app.core.security import verify_password
hash = '\$2b\$12\$...' # copied from DB
print(verify_password('password', hash))
"

# Check request format
curl -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{\"username\":\"testuser\",\"password\":\"testpass\"}'
```

#### 2. JWT Token Invalid

**Error**:
```
Invalid token
Decode error
```

**Solutions**:

```bash
# Decode JWT token to inspect
python -c "
import jwt
token = 'your_token_here'
decoded = jwt.decode(token, options={'verify_signature': False})
print(decoded)
"

# Check SECRET_KEY hasn't changed
# Tokens become invalid if SECRET_KEY changes

# Verify token expiry
# Default: 30 minutes
# In tests, use short expiry: timedelta(minutes=1)
```

---

### Network & Deployment

#### 1. Cannot Access from Different Machine

**Error**:
```
Cannot connect to server from another PC
localhost not accessible
```

**Solutions**:

```bash
# Backend: Change host from 127.0.0.1 to 0.0.0.0
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Check firewall
sudo ufw allow 8000
sudo ufw allow 5173

# Check if port is listening on all interfaces
sudo netstat -tulpn | grep :8000

# Use actual IP instead of localhost
# Get IP: hostname -I
curl http://192.168.x.x:8000/health
```

#### 2. HTTPS Certificate Errors

**Error**:
```
certificate verify failed
SSL: CERTIFICATE_VERIFY_FAILED
```

**Solutions**:

```bash
# Update certificate
sudo certbot renew

# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/domain/cert.pem

# Disable verification (development only!)
# In Python:
import requests
requests.get(url, verify=False)

# In JavaScript:
// This cannot be disabled in production browsers
// Must fix certificate issue
```

---

### Performance Issues

#### 1. High Memory Usage

**Error**:
```
Python process using 90%+ RAM
Node process consuming all memory
```

**Solutions**:

```bash
# Check memory usage
top -p $(pgrep -f uvicorn | tr '\n' ',')
ps aux | grep node

# Profile memory in Python
pip install memory-profiler
python -m memory_profiler app.py

# Find memory leaks
import tracemalloc
tracemalloc.start()

# Reduce model size
# Use yolov8n.pt instead of yolov8l.pt

# Implement garbage collection
gc.collect()
```

#### 2. Slow Frontend Build

**Error**:
```
npm run build takes >2 minutes
```

**Solutions**:

```bash
# Check bundle size
npm run build --analyze

# Remove unused packages
npm uninstall unused-package

# Use production build
npm run build  # vs npm run dev

# Clear cache
rm -rf dist node_modules

# Parallel build processes
npm config set max-workers=4
```

---

## 📋 Debugging Checklist

### When Something Breaks:

```
□ Check terminal output for error messages
□ Look at browser console (F12)
□ Check backend logs: tail -f logs/app.log
□ Verify services are running:
  ? Backend: curl http://localhost:8000/health
  ? Frontend: http://localhost:5173
  ? Database: psql -U neil -d ecosnap
□ Check .env files exist and have correct values
□ Restart services: kill and restart processes
□ Clear cache: ctrl+shift+delete in browser
□ Check firewall/network connectivity
□ Review recent changes: git diff
□ Search error message online
□ Create minimal reproducible example
□ Use debugger/breakpoints to step through code
```

---

## 📞 Getting Help

1. **Read error message carefully** - Usually describes the problem
2. **Google the error** - Most common issues have solutions online
3. **Check project documentation** - README.md, SETUP.md
4. **Search GitHub issues** - Dependency project issues
5. **Use logging** - Add print/console.log statements
6. **Use debugger** - VSCode debugger (F5) or browser DevTools (F12)
7. **Ask in communities**:
   - FastAPI Discord
   - React Discord
   - Stack Overflow
   - GitHub Discussions

---

## 🔗 Useful Commands

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m pytest                      # Run tests
python -m pytest --cov              # With coverage
uvicorn app.main:app --reload       # Dev server

# Frontend
cd frontend
npm install
npm run dev                          # Dev server
npm run build                        # Production build
npm run type-check                   # Check TypeScript
npm run lint                         # Lint code

# Database
psql -U neil -d ecosnap
SELECT * FROM users;
SELECT * FROM reports;

# System
lsof -i :8000                        # Check port 8000
ps aux | grep python                 # List Python processes
kill -9 <PID>                        # Kill process
```

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
