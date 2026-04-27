#!/bin/bash
# Start the ML service for Catchers AI

echo "🚀 Starting Catchers AI ML Service..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
