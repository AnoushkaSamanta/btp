#!/usr/bin/env bash
# Script to run both backend (FastAPI) and frontend (Vite) concurrently

echo "======================================================"
echo " Starting ASHA Co-Pilot (Backend + Frontend)"
echo "======================================================"

# Check if python virtualenv exists or python executable
PYTHON_BIN="python"
if [ -d "venv" ]; then
    PYTHON_BIN="venv/bin/python"
fi

# Start FastAPI Backend in background
echo "Starting FastAPI Backend at http://localhost:8000..."
$PYTHON_BIN -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait briefly for backend startup
sleep 2

# Start Frontend Dev Server
echo "Starting Frontend Dev Server at http://localhost:5173..."
cd frontend || exit 1
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM EXIT

wait
