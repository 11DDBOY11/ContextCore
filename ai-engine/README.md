# ContextCore — AI Engine (Member 3's Module)

## Setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Fill in OPENAI_API_KEY
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

## Get OpenAI API Key
- Go to platform.openai.com/api-keys
- Create new key, copy to .env

## What You Own
- `main.py` — FastAPI server with embed + ask endpoints
- ChromaDB runs in-memory (no DB setup needed)
- OpenAI embeddings + GPT-4o for RAG

## Endpoints
- POST /embed — receives chunks from backend, embeds and stores in ChromaDB
- POST /ask — embeds question, finds top 5 chunks, GPT-4o answers with citations
- GET /health — shows status + how many docs are in the knowledge base

## How RAG Works
1. /embed: text → OpenAI embedding (vector) → stored in ChromaDB
2. /ask: question → embed → cosine similarity search → top 5 chunks → GPT-4o prompt → cited answer
