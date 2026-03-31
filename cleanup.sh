#!/bin/bash
# Kill any old processes on ports 8000 and 8001
echo " Cleaning up old processes..."

# Kill processes on port 8000 (old backend port)
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Kill processes on port 8001 (current backend port)
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# Kill any uvicorn processes
pkill -9 uvicorn 2>/dev/null || true

# Kill any node/npm processes
pkill -9 node npm vite 2>/dev/null || true

echo "Cleanup complete. Waiting for ports to free up..."
sleep 2
