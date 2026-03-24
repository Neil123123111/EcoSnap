#!/bin/bash

echo "Starting EcoSnap..."

# chạy backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload &

# quay lại root
cd ..

# chạy frontend
cd frontend
npm run dev &

wait