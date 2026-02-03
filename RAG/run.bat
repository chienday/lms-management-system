@echo off
echo 🚀 Starting Political Theory RAG Chatbot with OpenAI API...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "rag_env" (
    echo 🐍 Creating Python virtual environment...
    python -m venv rag_env
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call rag_env\Scripts\activate.bat

REM Install/update dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file and add your OpenAI API key
    echo    Get your key from: https://platform.openai.com/api-keys
)

REM Ingest documents
echo 📚 Ingesting documents into vector database...
python src/ingest_documents.py

REM Start the API server
echo 🌐 Starting API server...
echo API will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
python src/api.py

REM Deactivate virtual environment
call rag_env\Scripts\deactivate.bat

pause