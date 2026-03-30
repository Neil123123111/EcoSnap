# Frontend & Backend Connection Setup

## ✅ What's Been Done

1. **CORS Enabled on Backend** - frontend can now make requests to the backend
2. **Environment Variables** - both frontend and backend now use `.env` files
3. **API URL Configuration** - dynamically loads from environment variables
4. **Health Check Endpoint** - added `/health` to verify backend is running

## 🚀 How to Run (Development)

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment
source venv/bin/activate

# 3. Install dependencies (if needed)
pip install -r requirements.txt

# 4. Run backend on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (New Terminal)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if needed)
npm install

# 3. Run frontend dev server (default: http://localhost:5173)
npm run dev
```

## 🔗 Connection Verification

**Backend Health Check:**
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"ok"}`

**Frontend API Test:**
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
