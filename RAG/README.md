# Political Theory RAG Chatbot with OpenAI API
# Local Adaptive RAG Research Agent using OpenAI API and Vector Embeddings

## Overview
This is a local RAG (Retrieval-Augmented Generation) system designed specifically for Political Theory documents. It uses OpenAI API (with free tier available) and ChromaDB for vector storage to provide intelligent answers about political theory concepts, ideologies, and historical contexts.

## Features
- **OpenAI API Integration**: Uses GPT-3.5-turbo (free tier available) for intelligent responses
- **Local Document Retrieval**: Searches through political theory documents stored in ChromaDB
- **Intelligent Query Expansion**: Generates relevant research questions from user input
- **Relevance Evaluation**: Assesses document relevance using AI reasoning
- **Structured Report Generation**: Creates well-formatted responses with political theory context
- **Chat History**: Maintains conversation context for follow-up questions

## Tech Stack
- **OpenAI API**: GPT-3.5-turbo model for text generation
- **ChromaDB**: Local vector database for document storage
- **Sentence Transformers**: Local embeddings for document chunking
- **FastAPI**: REST API for frontend integration
- **Python**: Core implementation language

## Installation
1. Get OpenAI API key:
   - Sign up at: https://platform.openai.com
   - Navigate to API Keys section
   - Create a new API key
   - Note: OpenAI provides $5 free credits for new users

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

4. Run the document ingestion:
   ```bash
   python src/ingest_documents.py
   ```

5. Start the API server:
   ```bash
   python src/api.py
   ```

## API Endpoints
- `POST /chat`: Send chat message and get AI response
- `GET /history`: Get chat history
- `DELETE /history`: Clear chat history

## Document Format
Place your political theory documents in the `documents/` folder. Supported formats:
- PDF files
- Text files (.txt)
- Markdown files (.md)

## Usage
The system will automatically:
1. Analyze user queries about political theory
2. Search local documents for relevant information
3. Evaluate document relevance and quality
4. Generate comprehensive answers with proper citations
5. Maintain conversation context for follow-up questions

## Cost Estimation
- **Free Tier**: OpenAI provides $5 free credits (approximately 1-2 million tokens)
- **Cost per request**: ~$0.002 for typical political theory queries
- **Local processing**: Embeddings and vector search run locally (no cost)

## Configuration Options
Edit `.env` file to customize:
- `OPENAI_MODEL`: Choose different models (gpt-4, gpt-3.5-turbo)
- `TEMPERATURE`: Adjust response creativity (0.0-1.0)
- `CHUNK_SIZE`: Document chunk size for embeddings
- `MAX_HISTORY_LENGTH`: Maximum chat history length