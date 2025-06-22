#!/bin/bash

echo "Starting Travel Planner API..."

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r travel_planner_api/requirements.txt

echo "Starting FastAPI server..."
echo "Server will be accessible at:"
echo "  Local: http://localhost:8000"
echo "  Network: http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}' 2>/dev/null || echo "your-ip"):8000"
echo ""

cd travel_planner_api
uvicorn main:app --reload --host 0.0.0.0 --port 8000