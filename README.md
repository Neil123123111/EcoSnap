# 🌱 EcoSnap - Environmental Issue Reporting Platform

A modern web application for reporting environmental violations with AI-powered analysis. Users upload images of environmental issues (trash, pollution, etc.), and the system automatically categorizes and analyzes them using computer vision models.

---

## 🎯 Features

### Core Features
- **🖼️ Image Upload & Analysis** - Upload images of environmental issues for AI analysis
- **🤖 AI Detection** - YOLOv8 object detection for identifying trash and environmental hazards
- **🔍 Classification** - ML model classification of waste types (cardboard, glass, metal, plastic, paper, trash)
- **📍 Location Mapping** - Interactive map showing reported issues with heatmap visualization
- **🔐 User Authentication** - JWT-based authentication with login/registration
- **📊 Dashboard** - User dashboard with report history and analytics
- **🎨 Dark Mode** - Light/dark theme support
- **📱 Responsive Design** - Mobile-optimized interface

### Backend Architecture
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **ML Models**: TensorFlow/Keras + YOLOv8
- **Authentication**: JWT tokens with bcrypt hashing
- **API**: RESTful endpoints with CORS support

### Frontend Architecture
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API for authentication
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Maps**: React Leaflet with OpenStreetMap

---

## 📋 System Requirements

### Backend
- Python 3.9+
- PostgreSQL 12+
- 2GB RAM minimum
- Model files: `yolov8n.pt`, `keras_model.h5`

### Frontend
- Node.js 16+
- npm 8+ or yarn 1.22+
- Modern browser (Chrome, Safari, Firefox, Edge)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd EcoSnap
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with your PostgreSQL credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/ecosnap

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Backend will be available at: `http://localhost:8000`  
Frontend will be available at: `http://localhost:5173`

---

## 📁 Project Structure

```
EcoSnap/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py          # JWT authentication endpoints
│   │   │   ├── report.py        # Image upload & analysis
│   │   │   └── health.py        # Health check endpoint
│   │   ├── models/
│   │   │   ├── user.py          # User database model
│   │   │   └── report.py        # Report database model
│   │   ├── schemas/
│   │   │   ├── user.py          # Pydantic user schemas
│   │   │   └── report.py        # Pydantic report schemas
│   │   ├── services/
│   │   │   ├── ai.py            # AI inference logic
│   │   │   ├── ai_yolo.py       # YOLOv8 object detection
│   │   │   └── ...
│   │   ├── core/
│   │   │   ├── database.py      # Database connection
│   │   │   ├── config.py        # Configuration management
│   │   │   └── security.py      # JWT & password hashing
│   │   ├── ai_model/
│   │   │   └── keras_model.h5   # Pre-trained classification model
│   │   └── main.py              # FastAPI app initialization
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example             # Environment variables template
│   └── yolov8n.pt              # YOLOv8 model weights
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── UploadForm.tsx
│   │   │   ├── AIResult.tsx
│   │   │   ├── HeatmapCanvas.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx  # Authentication state
│   │   │   └── ThemeContext.tsx # Dark mode state
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── scripts/
│   └── dev.sh                   # Development startup script
├── README.md                    # This file
├── SETUP.md                     # Detailed setup guide
├── LICENSE
└── package.json                 # Root package.json
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
GET    /auth/me                # Get current user (requires auth)
```

### Reports
```
POST   /report/analyze         # Upload & analyze image
GET    /report/{id}            # Get report details
GET    /report/list            # List user's reports
```

### Health
```
GET    /health                 # Backend health check
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://neil@localhost:5432/ecosnap
BASE_URL=http://localhost:8000
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## 📦 Dependencies

### Backend
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - ORM for database operations
- **Psycopg2** - PostgreSQL adapter
- **TensorFlow** - Deep learning framework
- **YOLOv8** - Real-time object detection
- **Bcrypt** - Password hashing
- **Python-JOSE** - JWT token handling
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **React Leaflet** - Maps integration
- **Axios** - HTTP client

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm run test
```

---

## 🏗️ Building for Production

### Backend
```bash
cd backend
# Run with production ASGI server
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check database connection
psql -h localhost -U neil -d ecosnap
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Model Loading Issues
- Ensure `yolov8n.pt` exists in backend root
- Ensure `keras_model.h5` exists in `backend/app/ai_model/`
- Check file permissions: `chmod 644 *.pt *.h5`

---

## 📝 Documentation

- [Detailed Setup Guide](./SETUP.md) - Step-by-step installation
- [Security Policy](./SECURITY.md) - Security considerations
- API documentation available at: `http://localhost:8000/docs` (Swagger UI)

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🤝 Support

For issues, bugs, or feature requests, please open an issue on GitHub.

---

## 🌍 Deployment

### Deploy Backend (Heroku/Railway)
```bash
# Add Procfile
web: gunicorn app.main:app --workers 4

# Deploy
git push heroku main
```

### Deploy Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting provider
```

---

**Made with 🌱 for environmental protection**
```

4. Chạy server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Kiểm tra API:

- Truy cập: `http://localhost:8001/docs`

---

## Frontend - Cài đặt và chạy

1. Di chuyển vào thư mục frontend:

```bash
cd frontend
```

2. Cài dependencies:

```bash
npm install
# hoặc
# yarn
```

3. Chạy dev server:

```bash
npm run dev
# hoặc
# yarn dev
```

4. Mở trình duyệt:

- Thường là `http://localhost:5173`

> Frontend mặc định gọi API backend tại `http://localhost:8000` (xem `src/services/api.ts`). Nếu backend chạy chế độ khác, chỉnh URL ở đó.

---

## Chạy cả frontend và backend chỉ bằng 1 dòng lệnh

1. Từ thư mục repo root:

```bash
npm install
npm run dev
```

2. Lệnh `npm run dev` đã được cấu hình trong `package.json`:

- Backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`

> Với Windows PowerShell, bạn cần thay `source venv/bin/activate` bằng `venv\Scripts\Activate.ps1`.

---

## Kiểm thử nhanh

1. Start backend
2. Start frontend
3. Truy cập UI
4. Upload ảnh và kiểm tra các bước:
   - ‌Xử lý mô tả bằng NLP
   - ‌Dự đoán loại rác / mức độ nghiêm trọng
   - ‌Hiển thị heatmap

---

## Khắc phục sự cố thường gặp

- Lỗi CORS: đảm bảo backend đang chạy và middleware CORS đã enable (có trong `app/main.py`).
- Lỗi kết nối từ frontend: kiểm tra `baseURL` trong `frontend/src/services/api.ts`.
- Lỗi dependency backend: dùng `pip install -r requirements.txt` lại trong virtualenv.

---

## Ghi chú

- Repo hiện sử dụng API cơ bản: chỉ có route prefix `/reports` (xem `backend/app/routes/report.py`).
- Nếu dự định deploy, nên bổ sung cấu hình biến môi trường, https và bảo mật upload file.


