# 🌱 EcoSnap — Environmental AI Platform

EcoSnap is a full-stack web application for reporting and analyzing environmental violations. Users submit images of environmental issues — littering, illegal dumping, pollution — and the system runs AI-powered object detection and waste classification to automatically identify and categorize the problem. Reports are geolocated, visualized on a heatmap, and shared with a community feed to drive collective action.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Classification** | YOLOv8 object detection + custom 8-class waste classifier (cardboard, glass, metal, paper, plastic, trash, and more) |
| **Evidence Upload** | Upload images with optional voice transcript and GPS coordinates |
| **Danger Zone Map** | Interactive Leaflet heatmap showing concentration of environmental reports |
| **Air Quality** | Real-time AQI data via IQAir API + hourly timeline via Open-Meteo |
| **Community Feed** | Post, like, and comment on environmental reports |
| **Dashboard** | Personal report history with stats |
| **User Profiles** | Avatar upload, display name, password change |
| **Dark Mode** | Full light/dark theme with persisted preference |
| **JWT Auth** | Secure login/register with bcrypt-hashed passwords |

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| Database | PostgreSQL + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt |
| AI / ML | YOLOv8 (ultralytics) + custom Roboflow classifier |
| Air Quality | IQAir API + Open-Meteo Air Quality API |
| Validation | Pydantic v2 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Maps | React Leaflet + OpenStreetMap |
| Icons | lucide-react |

---

## 📋 Requirements

### Backend
- Python 3.9+
- PostgreSQL 12+
- Model weights: `yolov8n.pt` and `best.pt` (custom classifier) in `backend/app/services/`

### Frontend
- Node.js 18+
- npm 9+

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone <repository-url>
cd EcoSnap
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\Activate.ps1       # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and API keys (see Environment Variables below)

# Start server
uvicorn app.main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`  
Interactive docs: `http://localhost:8001/docs`

### 3. Frontend

```bash
cd frontend
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8001" > .env

npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
EcoSnap/
├── backend/
│   ├── app/
│   │   ├── main.py               # App entry point, CORS, DB migrations
│   │   ├── core/
│   │   │   ├── config.py         # Settings from .env
│   │   │   ├── database.py       # SQLAlchemy engine & session
│   │   │   └── security.py       # JWT creation/verification, bcrypt
│   │   ├── models/
│   │   │   ├── user.py           # User ORM model
│   │   │   ├── report.py         # Report ORM model
│   │   │   └── community.py      # CommunityPost / Comment ORM models
│   │   ├── schemas/
│   │   │   ├── user.py           # Pydantic user schemas
│   │   │   ├── report.py         # Pydantic report schemas
│   │   │   ├── classifier.py     # AI response schemas
│   │   │   └── train.py          # Training job schemas
│   │   ├── routes/
│   │   │   ├── auth.py           # /auth/* endpoints
│   │   │   ├── report.py         # /report/* endpoints
│   │   │   ├── community.py      # /community/* endpoints
│   │   │   ├── train.py          # /train endpoint
│   │   │   └── health.py         # /health endpoints
│   │   ├── services/
│   │   │   ├── ai.py             # AI orchestration
│   │   │   ├── ai_classifier.py  # Custom waste classifier
│   │   │   ├── ai_yolo.py        # YOLOv8 inference
│   │   │   ├── iqair.py          # IQAir API client
│   │   │   ├── open_meteo.py     # Open-Meteo API client
│   │   │   ├── train.py          # YOLOv8 training jobs
│   │   │   └── best.pt           # Custom classifier weights
│   │   ├── ai_model/             # Training dataset (Roboflow)
│   │   └── static/upload/        # Uploaded & annotated images
│   ├── runs/                     # YOLOv8 training run outputs
│   ├── yolov8n.pt                # YOLOv8n base weights
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── UploadEvidencePage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CommunityReportPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── AIResult.tsx
│   │   │   ├── UploadForm.tsx
│   │   │   ├── HeatmapDangerMap.tsx
│   │   │   ├── DangerZoneDetection.tsx
│   │   │   ├── CommunityDataTransparency.tsx
│   │   │   ├── VoiceInput.tsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # User auth state
│   │   │   ├── ThemeContext.tsx  # Dark/light mode
│   │   │   └── ToastContext.tsx  # Global toast notifications
│   │   └── services/
│   │       └── api.ts            # Centralized API client
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── scripts/
    └── dev.sh                    # One-command dev startup
```

---

## 🔌 API Reference

### Authentication — `/auth`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | — |
| POST | `/auth/login` | Login, returns JWT | — |
| GET | `/auth/me` | Get current user | ✓ |
| PATCH | `/auth/profile` | Update display name, avatar, or password | ✓ |

### Reports — `/report`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/report/classify` | Upload image → AI result (YOLO + classifier) | — |
| POST | `/report/submit` | Submit a geolocated report | ✓ |
| GET | `/report/recent` | List recent public reports | — |
| GET | `/report/model-info` | Classifier metadata | — |
| GET | `/report/air-quality` | Current AQI for a location | — |
| GET | `/report/air-quality-timeline` | Hourly AQI forecast | — |

### Community — `/community`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/community/posts` | List community posts | — |
| POST | `/community/posts` | Create a post | ✓ |
| POST | `/community/posts/{id}/like` | Like / unlike a post | ✓ |
| DELETE | `/community/posts/{id}` | Delete own post | ✓ |
| POST | `/community/posts/{id}/comments` | Add comment | ✓ |
| DELETE | `/community/posts/{id}/comments/{cid}` | Delete own comment | ✓ |

### Health — `/health`
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/health/db` | Database connectivity check |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecosnap
BASE_URL=http://localhost:8001
SECRET_KEY=your-secret-key-here
IQAIR_API_KEY=your-iqair-key
IQAIR_BASE_URL=https://api.airvisual.com/v2
OPEN_METEO_AIR_QUALITY_BASE_URL=https://air-quality-api.open-meteo.com/v1
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8001
```

---

## 🏭 Production Build

### Backend
```bash
cd backend
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Frontend
```bash
cd frontend
npm run build
# Serve the generated dist/ folder with any static host (Nginx, Netlify, Vercel, etc.)
```

---

## 🐛 Troubleshooting

**Backend won't start — database error**
```bash
# Verify PostgreSQL is running and the DB exists
psql -U postgres -c "CREATE DATABASE ecosnap;"
```

**`yolov8n.pt` / `best.pt` not found**  
Ensure the model files are present:
- `backend/yolov8n.pt`
- `backend/app/services/best.pt`

**Frontend can't reach backend**  
Confirm `VITE_API_URL` in `frontend/.env` matches the port your backend is running on (`8001` by default).

**Column missing error after DB upgrade**  
The app runs automatic migrations on startup via `ensure_report_columns()` and `ensure_user_columns()` in `main.py`. Simply restart the backend.

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

**Made with 🌱 for environmental protection**

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


