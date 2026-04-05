#!/bin/bash

# AI Service Startup Script
# Starts the FastAPI microservice with proper configuration

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AI Learning Analytics Microservice    ║${NC}"
echo -e "${BLUE}║  FastAPI + MongoDB + OpenAI            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}→${NC} Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

# Install/upgrade dependencies
echo -e "${YELLOW}→${NC} Installing dependencies from requirements.txt..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Dependencies installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC}  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}→${NC} Please edit .env with your configuration"
        echo -e "${YELLOW}→${NC} Especially set these variables:"
        echo "     - MONGODB_URI"
        echo "     - OPENAI_API_KEY"
    fi
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verify required environment variables
if [ -z "$MONGODB_URI" ]; then
    echo -e "${YELLOW}⚠${NC}  MONGODB_URI not set in .env"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠${NC}  OPENAI_API_KEY not set in .env"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Starting FastAPI Service             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "📚 API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo -e "🔍 Enhanced Docs:     ${BLUE}http://localhost:8000/redoc${NC}"
echo -e "❤️  Health Check:      ${BLUE}http://localhost:8000/health${NC}"
echo ""

# Start the FastAPI server
# Use --reload for development, remove for production
if [ "$1" = "prod" ]; then
    echo -e "${YELLOW}→${NC} Starting in PRODUCTION mode..."
    echo "  Workers: 4"
    exec python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
else
    echo -e "${YELLOW}→${NC} Starting in DEVELOPMENT mode (with auto-reload)..."
    exec python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
fi
