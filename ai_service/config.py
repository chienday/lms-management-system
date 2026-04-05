"""
Configuration module for AI Learning Analytics Service
Loads environment variables and sets up application constants
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ========================
# MONGODB CONFIGURATION
# ========================
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "lms_db")

# ========================
# AI/LLM CONFIGURATION
# ========================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", 30))
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", 1000))
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", 0.7))

# ========================
# CORS CONFIGURATION
# ========================
# Frontend URL - should be configured for production
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

# ========================
# APPLICATION CONFIGURATION
# ========================
APP_TITLE = "AI Learning Analytics Service"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# ========================
# LOGGING CONFIGURATION
# ========================
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
