# ContextCore — Full Project

## The Idea
RAG-powered project intelligence. Feed it a GitHub repo + docs, ask it anything, get cited answers.

## Architecture
Frontend (React) → Backend (Node.js) → AI Engine (Python/FastAPI) → ChromaDB + OpenAI

## Run Everything
Terminal 1 — AI Engine:
  cd ai-engine && uvicorn main:app --reload --port 8000

Terminal 2 — Backend:
  cd backend && npm run dev

Terminal 3 — Frontend:
  cd frontend && npm run dev

## Team
- Darshan → frontend/
- Member 2 → backend/
- Member 3 → ai-engine/
