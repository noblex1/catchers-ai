#!/bin/bash
# Train the ML model for Catchers AI

echo "🚀 Starting ML Model Training..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Train the model
python -m app.train_model

echo ""
echo "✅ Training complete! Model is ready to use."
echo ""
echo "To start the ML service, run:"
echo "  ./start.sh"
