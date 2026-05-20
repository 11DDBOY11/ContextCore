# ContextCore — Frontend (Darshan's Module)

## Setup
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## What You Own
- `src/App.jsx` — Root layout
- `src/components/Sidebar.jsx` — GitHub URL input + file upload + ingest button
- `src/components/ChatWindow.jsx` — Chat UI with messages + citations
- `src/api/ingest.js` — Calls /api/ingest/github and /api/ingest/file
- `src/api/ask.js` — Calls /api/ask

## How It Connects
- Frontend proxies all /api/* calls to backend on port 5000
- Configured in vite.config.js — no CORS issues in dev
- For production: deploy to Vercel, set VITE_API_URL env variable

## Key Flow
1. User enters GitHub URL → Sidebar calls ingestGithub()
2. User uploads file → Sidebar calls ingestFile()
3. User types question → ChatWindow calls askQuestion()
4. Answer + sources displayed in chat
