# ContextCore — Team Setup & Project Documentation

**Project:** ContextCore — RAG-Powered Project Intelligence System  
**Hackathon:** HackWithBangalore 3.0 / HackwithIndia — May 23, 2026  
**Team Lead:** Darshan Dashyal

---

## What Is ContextCore?

ContextCore is a full-stack AI-powered web app that lets developers understand any GitHub repository by asking plain English questions. You feed it a GitHub repo URL (and optionally a meeting notes file), it builds a vector knowledge base from the repo's README, commits, issues, and source code files, and then answers your questions with cited sources — no hallucination.

> *"Ask anything about your project. Get cited answers from real project data."*

---

## System Architecture

```
User (Browser)
     │
     ▼
Frontend — React + TailwindCSS (Port 5173)
     │  /api/* calls
     ▼
Backend — Node.js + Express (Port 5000)
     │  Fetches GitHub data, parses files
     ▼
AI Engine — Python + FastAPI (Port 8000)
     │  Embeds text → ChromaDB
     │  Query → GPT-4o → Cited Answer
     ▼
OpenAI API (text-embedding-3-small + gpt-4o)
```

---

## Team Responsibilities

| Member | Module | Folder |
|--------|--------|--------|
| Darshan | Frontend (React UI) | `contextcore/frontend/` |
| Member 2 | Backend (Node.js API) | `contextcore/backend/` |
| Member 3 | AI Engine (Python RAG) | `contextcore/ai-engine/` |

---

## Project Folder Structure

```
contextcore/
├── frontend/
│   ├── package.json
│   ├── vite.config.js          ← proxies /api → port 5000
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             ← root layout
│       ├── index.css           ← design tokens
│       ├── components/
│       │   ├── Sidebar.jsx     ← GitHub URL input + file upload
│       │   └── ChatWindow.jsx  ← chat UI with citations
│       └── api/
│           ├── ingest.js       ← calls /api/ingest/github and /api/ingest/file
│           └── ask.js          ← calls /api/ask
├── backend/
│   ├── package.json
│   ├── server.js               ← Express server, all API routes
│   ├── github.js               ← GitHub REST API fetcher
│   ├── fileParser.js           ← PDF + TXT text extractor
│   └── .env.example
└── ai-engine/
    ├── main.py                 ← FastAPI server, ChromaDB, OpenAI RAG
    ├── requirements.txt
    └── .env.example
```

---

## Prerequisites — Install These First

### Everyone
- **Node.js** (v18+) — https://nodejs.org
- **Python** (v3.11) — https://python.org (tick ✅ "Add Python to PATH" during install)
- **VS Code** — https://code.visualstudio.com
- **Git** — https://git-scm.com

### Verify installations
```bash
node --version      # should show v18+
python --version    # should show Python 3.11.x
npm --version       # should show 9+
pip --version       # should show pip 23+
```

---

## Environment Variables Setup

### Backend — `contextcore/backend/.env`
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_ENGINE_URL=http://localhost:8000
PORT=5000
```

**How to get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Set expiry: 30 days
4. Check scope: ✅ `repo`
5. Click Generate — **copy immediately, shown only once**

### AI Engine — `contextcore/ai-engine/.env`
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy and paste into `.env`

> ⚠️ Never commit `.env` files to GitHub. They contain secret keys.

---

## Setup Instructions

### Step 1 — Download & Extract
- Download `contextcore-starter.zip`
- Extract it — you get a `contextcore/` folder
- Open the folder in VS Code: `File → Open Folder → contextcore`

### Step 2 — Fix PowerShell (Windows Only)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Type `Y` when prompted. This is a one-time fix.

### Step 3 — Setup Frontend (Darshan)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Step 4 — Setup Backend (Member 2)
```bash
cd backend
npm install
# Rename .env.example to .env and fill in GITHUB_TOKEN
npm run dev
# Runs at http://localhost:5000
```

### Step 5 — Setup AI Engine (Member 3)
```bash
cd ai-engine
python -m pip install -r requirements.txt
# Rename .env.example to .env and fill in OPENAI_API_KEY
python -m uvicorn main:app --reload --port 8000
# Runs at http://localhost:8000
```

---

## Known Issues & Fixes

### Issue 1 — `uvicorn` is not recognized
**Fix:** Use `python -m` prefix:
```bash
python -m uvicorn main:app --reload --port 8000
```

### Issue 2 — `np.float_` NumPy 2.0 error
**Fix:** Downgrade NumPy and reinstall ChromaDB:
```bash
python -m pip install "numpy<2" "chromadb==0.5.0"
```

### Issue 3 — OpenAI `proxies` TypeError
**Fix:** Upgrade OpenAI and pin httpx:
```bash
python -m pip install --upgrade openai
python -m pip install httpx==0.27.2
```

### Issue 4 — `npm` not recognized (PowerShell)
**Fix:** Run the ExecutionPolicy command in Step 2 above, or switch VS Code terminal to Command Prompt:
- `Ctrl+Shift+P` → "Select Default Profile" → "Command Prompt"

### Issue 5 — Old repo data mixing with new repo
**Fixed in code:** The frontend now calls `/api/reset` before every new ingestion, which clears ChromaDB. This is already in the latest `Sidebar.jsx`.

---

## API Endpoints Reference

### Backend (Port 5000)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Check if backend is running |
| POST | `/api/ingest/github` | `{ repoUrl }` | Fetch + embed GitHub repo |
| POST | `/api/ingest/file` | `multipart file` | Upload + embed document |
| POST | `/api/ask` | `{ question }` | Ask a question |
| POST | `/api/reset` | — | Clear all knowledge base data |

### AI Engine (Port 8000)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Check status + doc count |
| POST | `/embed` | `{ chunks, source }` | Embed text chunks into ChromaDB |
| POST | `/ask` | `{ question }` | RAG query → GPT-4o answer |
| POST | `/reset` | — | Delete + recreate ChromaDB collection |

---

## How to Verify Everything is Working

### Check all 3 servers are live
Open these URLs in browser:
- http://localhost:5173 → Should show ContextCore UI
- http://localhost:5000/api/health → Should show `{"status":"ok"}`
- http://localhost:8000/health → Should show `{"status":"ok","docs_count":0}`

### Full end-to-end test
1. Open http://localhost:5173
2. Paste any public GitHub repo URL in the sidebar
3. Click **"Build Knowledge Base"**
4. Watch status: "Clearing old data..." → "Fetching GitHub data..." → "✅ Knowledge base ready!"
5. Ask: `"What does this project do?"` → Should get a cited answer
6. Ask: `"What npm packages are installed?"` → Should cite `package.json`

---

## How the RAG Pipeline Works

1. **Ingestion:** GitHub REST API fetches README, last 20 commits, issues, and up to 10 source files
2. **Chunking:** Text is split into ~500 word chunks
3. **Embedding:** Each chunk is converted to a vector using OpenAI `text-embedding-3-small`
4. **Storage:** Vectors stored in ChromaDB (in-memory, no DB setup needed)
5. **Query:** User's question is embedded → cosine similarity search finds top 5 matching chunks
6. **Generation:** GPT-4o receives the 5 chunks as context and answers with citations
7. **Response:** Answer + source names returned to frontend and displayed in chat

---

## Cost Estimate (OpenAI API)

| Operation | Estimated Calls | Cost |
|-----------|----------------|------|
| `text-embedding-3-small` (ingestion) | ~500 chunks | ~$0.10 |
| `text-embedding-3-small` (queries) | ~50 queries | ~$0.01 |
| `gpt-4o` (answers) | ~50 queries | ~$1.50 |
| **Total** | | **~$1.61** |

Well within the $10 OpenAI credits budget.

---

## Tips for Better Q&A Results

ContextCore works best with **specific questions**, not broad ones.

| ❌ Vague (less useful) | ✅ Specific (better answers) |
|----------------------|---------------------------|
| "explain the UI" | "what CSS framework is used?" |
| "tell me about security" | "how is authentication implemented?" |
| "what is this project" | "what does the README say this project does?" |
| "explain everything" | "what packages are in package.json?" |

---

## Hackathon Day Checklist

- [ ] All 3 `.env` files filled with real keys
- [ ] Full end-to-end test done at home before leaving
- [ ] Demo GitHub repo chosen (use one of your own projects)
- [ ] Mock `meeting-notes.txt` file prepared for file upload demo
- [ ] 2-minute pitch script rehearsed
- [ ] Laptop charged to 100%
- [ ] Hotspot ready as backup internet

---

## Demo Script (2 Minutes)

**[0:00]** *"Developers lose hours digging through old code, commits, and meeting notes when they join a project. We built ContextCore — a RAG-powered project intelligence layer."*

**[0:20]** *Paste GitHub repo URL → click Build Knowledge Base*  
*"We're ingesting the README, commits, issues, and source files right now..."*

**[0:40]** *Ask: "What does this project do?"*  
*"Notice the answer is cited — it comes from README.md. No hallucination."*

**[1:00]** *Ask: "What packages are installed?"*  
*"Now it's reading the actual source files — package.json."*

**[1:20]** *Upload meeting-notes.txt → Ask: "What was decided in the architecture meeting?"*  
*"It reads your documents too — not just the repo."*

**[1:40]** *"This works for any public GitHub repo, in under 30 seconds, with zero setup. That's ContextCore."*

---

*Documentation prepared: May 5, 2026*  
*For questions, contact Darshan on the team WhatsApp group.*
