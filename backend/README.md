# ContextCore — Backend (Member 2's Module)

## Setup
```bash
npm install
cp .env.example .env
# Fill in GITHUB_TOKEN and AI_ENGINE_URL
npm run dev
# Runs on http://localhost:5000
```

## Get GitHub Token
1. Go to github.com/settings/tokens
2. Generate new token (classic)
3. Select 'repo' scope
4. Copy token to .env

## What You Own
- `server.js` — Express server with 3 endpoints
- `github.js` — Fetches README, commits, issues from GitHub API
- `fileParser.js` — Extracts text from PDF and TXT files

## Endpoints
- POST /api/ingest/github — { repoUrl } → fetches repo data → sends to AI engine
- POST /api/ingest/file — multipart form → parses file → sends to AI engine
- POST /api/ask — { question } → forwards to AI engine → returns answer

## Environment Variables
- GITHUB_TOKEN — Personal access token (read-only repo scope)
- AI_ENGINE_URL — http://localhost:8000 (local) or Render URL (prod)
- PORT — 5000
