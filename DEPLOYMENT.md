# EcoSnap - Production Deployment Guide

Comprehensive guide for deploying EcoSnap to production environments.

---

## Deployment Options

### 1. Cloud Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS, Google Cloud
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Database**: AWS RDS, Google Cloud SQL, Railway PostgreSQL

### 2. Self-Hosted
- **Server**: Linux VPS, Dedicated Server
- **Reverse Proxy**: Nginx, Apache
- **SSL**: Let's Encrypt (Certbot)

---

## Pre-Deployment Checklist

- ✅ All tests passing
- ✅ No console errors/warnings (frontend)
- ✅ No linting errors (`npm run lint`)
- ✅ Environment variables configured
- ✅ Database backups created
- ✅ SSL certificate ready
- ✅ Domain name configured
- ✅ Monitoring/logging setup

---

## Backend Deployment

### Option 1: Heroku

#### Setup
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set BASE_URL=https://your-app.herokuapp.com
```

#### Create Procfile
```
# backend/Procfile
web: gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

#### Deploy
```bash
git push heroku main
heroku open
```

### Option 2: Railway

#### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Set environment variables in Dashboard
# Redeploy after adding database
```

#### Deploy
```bash
railway up
```

### Option 3: DigitalOcean App Platform

#### Deploy via GitHub
1. Connect GitHub repository
2. Set environment variables in Dashboard
3. Create database (PostgreSQL)
4. Deploy

### Option 4: Self-Hosted (Ubuntu/Debian)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python, PostgreSQL, Nginx
sudo apt install python3.10 python3.10-venv postgresql postgresql-contrib nginx -y

# Create app user
sudo useradd -m -s /bin/bash ecosnap
sudo su - ecosnap
```

#### 2. Clone Repository
```bash
git clone <repo-url>
cd EcoSnap/backend
```

#### 3. Setup Environment
```bash
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

#### 4. Create .env
```bash
nano .env
# Add production environment variables
```

#### 5. Configure Systemd Service
```bash
# As root/sudo
sudo nano /etc/systemd/system/ecosnap-backend.service
```

```ini
[Unit]
Description=EcoSnap Backend
After=network.target postgresql.service

[Service]
User=ecosnap
WorkingDirectory=/home/ecosnap/EcoSnap/backend
ExecStart=/home/ecosnap/EcoSnap/backend/venv/bin/gunicorn \
    app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 6. Enable Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable ecosnap-backend
sudo systemctl start ecosnap-backend
sudo systemctl status ecosnap-backend
```

#### 7. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ecosnap
```

```nginx
upstream uvicorn {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://uvicorn;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/ecosnap/EcoSnap/backend/app/static/;
    }
}
```

#### 8. Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/ecosnap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. Setup SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 10. Test
```bash
curl https://yourdomain.com/health
# Should return {"status":"ok"}
```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

#### Connect Repository
1. Go to vercel.com
2. Import your GitHub repository
3. Set VITE_API_URL environment variable
4. Deploy

#### Custom Domain
1. Go to Project Settings
2. Add custom domain
3. Update DNS records

### Option 2: Netlify

#### 1. Connect Repository
1. Go to netlify.com
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`

#### 2. Environment Variables
1. Go to Site Settings → Build & Deploy → Environment
2. Add: `VITE_API_URL=https://your-api.com`

#### 3. Custom Domain
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

### Option 3: AWS S3 + CloudFront

#### 1. Build Frontend
```bash
cd frontend
npm run build
```

#### 2. Create S3 Bucket
```bash
aws s3 mb s3://your-domain-com --region us-east-1
```

#### 3. Enable Static Website Hosting
```bash
aws s3 website s3://your-domain-com/ \
    --index-document index.html \
    --error-document index.html
```

#### 4. Upload Files
```bash
aws s3 sync dist/ s3://your-domain-com/ \
    --delete \
    --cache-control "max-age=31536000"
```

#### 5. Create CloudFront Distribution
1. Link to S3 bucket
2. Set default root object to `index.html`
3. Add custom domain
4. Create SSL certificate

### Option 4: Self-Hosted

#### 1. Build
```bash
cd frontend
npm run build
```

#### 2. Copy to Server
```bash
scp -r dist/* user@server:/var/www/ecosnap/
```

#### 3. Configure Nginx
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/ecosnap;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend-server:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🗄️ Database Setup

### Managed Database (Recommended)

#### AWS RDS
```bash
# Create from AWS Console
# Engine: PostgreSQL 15
# Instance: db.t3.micro (free tier eligible)
# Copy connection string to backend .env
```

#### Google Cloud SQL
```bash
# Create from Google Cloud Console
# Connect from Cloud Shell:
gcloud sql instances create ecosnap-db \
    --database-version POSTGRES_15 \
    --tier db-f1-micro
```

### Self-Hosted PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE ecosnap;"
sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecosnap TO app_user;"

# Configure pg_hba.conf for connections
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * pg_dump -U app_user ecosnap | gzip > /backups/ecosnap_$(date +\%Y\%m\%d).sql.gz

# Upload to S3
0 3 * * * aws s3 cp /backups/ecosnap_*.sql.gz s3://my-backups/
```

---

## 🔒 Security Hardening

### SSL/TLS
```bash
# Use A+ rating on SSL Labs
# Minimum: TLS 1.2
# Strong ciphers: AES-256-GCM

# Update Nginx:
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### CORS Configuration
```python
# Only allow your frontend domain
allow_origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

### Rate Limiting
```python
# Install slowapi
pip install slowapi

# Add to FastAPI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(...):
    pass
```

### DDoS Protection
- Use CloudFlare as DNS provider
- Enable WAF rules
- Rate limiting
- IP blocking for suspicious activity

---

## Monitoring & Logging

### Backend Monitoring

```bash
# Install application monitoring
pip install sentry-sdk

# Add to FastAPI
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-key@sentry.io/project",
    integrations=[FastApiIntegration()]
)
```

### Log Aggregation

```bash
# Using ELK Stack (Elasticsearch, Logstash, Kibana)
# Or simpler: Papertrail, LogDNA

# Configure logging in FastAPI
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Performance Monitoring

```bash
# Use New Relic, DataDog, or similar
# Monitor:
# - API response times
# - Database query performance
# - Error rates
# - Memory usage
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  backend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy backend
        run: |
          ssh -i ${{ secrets.SSH_KEY }} user@server "cd /app && git pull && pip install -r requirements.txt && systemctl restart ecosnap-backend"

  frontend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build
        run: cd frontend && npm install && npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## ✅ Post-Deployment Verification

```bash
# Test API endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/docs

# Test authentication
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test image upload
curl -X POST https://yourdomain.com/report/analyze \
  -F "file=@test.jpg"

# Monitor logs
tail -f /var/log/nginx/access.log
systemctl status ecosnap-backend
```

---

## 🔧 Troubleshooting

### Backend Issues

**502 Bad Gateway**
```bash
# Check backend service
systemctl status ecosnap-backend

# Check logs
journalctl -u ecosnap-backend -n 50

# Restart
systemctl restart ecosnap-backend
```

**Database Connection Error**
```bash
# Test database
psql -h db.host -U user -d ecosnap

# Check credentials
cat /etc/ecosnap/.env
```

### Frontend Issues

**Blank Page**
- Check browser console for errors
- Verify API_URL is correct
- Check CORS headers

**Slow Load Time**
- Enable CDN
- Minimize bundle size
- Enable gzip compression

---

## 📝 Scaling Considerations

### Horizontal Scaling
```bash
# Multiple backend instances behind load balancer
# Use Nginx/HAProxy for load balancing

upstream backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}
```

### Caching
```python
# Add Redis for caching
pip install redis
# Cache frequently accessed data
```

### Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Monitor query performance

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
