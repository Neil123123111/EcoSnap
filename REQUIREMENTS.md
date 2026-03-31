# EcoSnap - Complete Requirements & Dependencies

This document details all system requirements, dependencies, and their purposes.

---

## 🖥️ System Requirements

### Minimum Hardware
- **CPU**: Intel Core i5 or equivalent (quad-core recommended)
- **RAM**: 4GB (8GB+ recommended for ML models)
- **Storage**: 15GB free space (models: ~500MB, database: variable)
- **GPU**: Optional (TensorFlow can run on CPU)

### Software Prerequisites

#### Windows/macOS/Linux Common
- **Git**: 2.x or higher
- **NPM**: 8.x or higher (comes with Node.js)

#### macOS/Linux
- **Python**: 3.9+ (3.10+ recommended)
- **PostgreSQL**: 12+
- **Node.js**: 16+

#### Windows
- **Python**: 3.9+ (from python.org)
- **PostgreSQL**: 12+ (from postgresql.org)
- **Node.js**: 16+ (from nodejs.org)
- **Git Bash** or WSL2 (recommended)

---

## 🐍 Backend Dependencies

### Core Framework (9.8 MB)
```
fastapi==0.104.1              # Modern async web framework
uvicorn[standard]==0.24.0     # ASGI server
python-multipart==0.0.6       # Form data handling
```

### Database (2.3 MB)
```
sqlalchemy==2.0.23            # SQL toolkit & ORM
psycopg2-binary==2.9.9        # PostgreSQL adapter
alembic==1.12.1               # Database migrations
```

### Authentication (3.5 MB)
```
bcrypt==4.1.1                 # Password hashing
passlib==1.7.4                # Password hashing framework
python-jose[cryptography]==3.5.0  # JWT tokens
cryptography==41.0.7          # Cryptography operations
email-validator==2.1.0        # Email validation
```

### Data Validation (12 MB)
```
pydantic==2.5.0               # Data validation
pydantic[email]==2.5.0        # Email field support
```

### AI/ML Models (2.5 GB download, 600 MB extracted)
```
tensorflow-macos==2.16.0      # Deep learning (macOS)
tensorflow-metal==1.1.0       # GPU acceleration (macOS M1/M2)
ultralytics==8.0.216          # YOLOv8 object detection
pillow==10.1.0                # Image processing
numpy==1.24.3                 # Numerical computing
```

### Environment Management (32 KB)
```
python-dotenv==1.0.0          # Load .env files
```

### Production Server (Optional)
```
gunicorn==21.2.0              # Production ASGI server
```

### Development & Testing (Optional)
```
pytest==7.4.3                 # Testing framework
pytest-asyncio==0.21.1        # Async test support
```

### Installation Size
- **Without ML models**: ~600 MB
- **With ML models**: ~2.8 GB
- **Virtual environment**: ~3.5 GB total

---

## 📦 Frontend Dependencies

### Core Framework (3.2 MB)
```json
"react": "^19.2.4"            // UI library
"react-dom": "^19.2.4"        // DOM renderer
"react-router-dom": "^7.13.2" // Client routing
```

### Styling (500 KB)
```json
"tailwindcss": "^3.4.19"      // Utility CSS framework
```

### UI Components & Animations (1.8 MB)
```json
"framer-motion": "^12.38.0"   // Animation library
"lucide-react": "^1.0.1"      // Icon library
```

### Mapping (800 KB)
```json
"leaflet": "^1.9.4"           // Map library
"react-leaflet": "^5.0.0"     // React wrapper for Leaflet
```

### HTTP Client (250 KB)
```json
"axios": "^1.13.6"            // HTTP client
```

### Build Tools (340 MB)
```json
"vite": "^8.0.1"              // Build tool & dev server
"typescript": "~5.9.3"        // Type safety
"@vitejs/plugin-react": "^6.0.1"  // React plugin for Vite
```

### Linting & Code Quality (45 MB)
```json
"eslint": "^9.39.4"           // JavaScript linter
"@eslint/js": "^9.39.4"       // ESLint rules
"typescript-eslint": "^8.57.0"    // TypeScript ESLint
"eslint-plugin-react-hooks": "^7.0.1"  // React hooks linting
"eslint-plugin-react-refresh": "^0.5.2"  // React refresh
```

### Type Definitions (25 MB)
```json
"@types/react": "^19.2.14"
"@types/react-dom": "^19.2.3"
"@types/leaflet": "^1.9.21"
"@types/node": "^24.12.0"
```

### PostCSS & Autoprefixer (3 MB)
```json
"postcss": "^8.5.8"
"autoprefixer": "^10.4.27"
"@tailwindcss/postcss": "^4.2.2"
```

### Installation Size
- **node_modules**: ~450 MB
- **Build output (dist)**: ~200 KB (gzipped)
- **Total with dev deps**: ~500 MB

---

## 📊 Dependency Comparison

| Package | Backend | Frontend | Size |
|---------|---------|----------|------|
| React | ❌ | ✅ | 40 MB |
| TensorFlow | ✅ | ❌ | 1.2 GB |
| TypeScript | ❌ | ✅ | 80 MB |
| Vite | ❌ | ✅ | 180 MB |
| FastAPI | ✅ | ❌ | 10 MB |
| SQLAlchemy | ✅ | ❌ | 5 MB |

---

## 🔄 Update Strategy

### Backend Dependencies
```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade fastapi

# Update all packages
pip install --upgrade -r requirements.txt
```

### Frontend Dependencies
```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update react

# Update all packages
npm update

# Major version update (breaking changes possible)
npm install react@latest
```

---

## 🔒 Security Considerations

### Backend
- **Bcrypt**: Industry-standard password hashing (4+ rounds)
- **JWT**: Secure token-based authentication
- **HTTPS**: Required in production (use HTTPS URLs)
- **CORS**: Configured to only allow frontend origin

### Frontend
- **Cookie Storage**: Auth tokens stored in localStorage (consider secure cookies)
- **HTTPS**: Should be deployed with HTTPS
- **Content Security Policy**: Configure for production

---

## 🚀 Production Deployment

### Backend Production Requirements
```
gunicorn==21.2.0           # Production server
psycopg2-binary==2.9.9     # Always needed
python-dotenv==1.0.0       # Keep for .env loading
tensorflow-macos==2.16.0   # Or tensorflow for Linux/Windows
```

### Frontend Production Requirements
```
All dependencies included - npm run build creates optimized bundle
```

---

## 📝 Environment-Specific Versions

### Development
- Use latest minor versions
- Allow experimental features
- Include dev/test dependencies

### Production
- Fix specific versions (pin exact versions)
- Remove dev dependencies
- Test thoroughly before deploying

### Example Production requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
# ... (fixed versions, no dev dependencies)
gunicorn==21.2.0
```

---

## 🔧 Troubleshooting

### Python Version Issues
```bash
# Check Python version
python3 --version

# Use specific interpreter
python3.10 -m venv venv
```

### PostgreSQL Connection
```bash
# Test connection
psql -h localhost -U neil -d ecosnap
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### ML Model Issues
```bash
# YOLOv8 will auto-download on first use
# Keras model should be placed in backend/app/ai_model/

# Check model files exist
ls -la backend/yolov8n.pt
ls -la backend/app/ai_model/keras_model.h5
```

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **TensorFlow Docs**: https://www.tensorflow.org/
- **YOLOv8 Docs**: https://docs.ultralytics.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
