#!/bin/bash

# Political Theory RAG Chatbot Setup Script with OpenAI API

echo "🚀 Setting up Political Theory RAG Chatbot with OpenAI API..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Create virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv rag_env
source rag_env/bin/activate  # On Windows: rag_env\Scripts\activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your OpenAI API key"
    echo "   Get your key from: https://platform.openai.com/api-keys"
fi

# Ingest documents
echo "📚 Ingesting documents..."
python src/ingest_documents.py

echo "✅ Setup completed!"
echo ""
echo "To start the chatbot API:"
echo "1. Activate virtual environment: source rag_env/bin/activate"
echo "2. Run API: python src/api.py"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Frontend integration: Add chatbot button to admin sidebar"