<div align="center">

# ContextCore

**A repo assistant that remembers your codebase — not just searches it.**

[
[
[
[
[

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Usage](#usage) · [Project Structure](#project-structure) · [Contributing](#contributing)

</div>

***

## Overview

Most repo Q&A tools retrieve relevant chunks but don't truly *remember* anything. Restart the app and you're back to square one — re-ingesting the same codebase and rebuilding the same context.

**ContextCore** solves this by wiring persistent memory as a first-class layer. Ingest a repository once, then ask plain-English questions about it across sessions: what the project does, how files connect, where the core logic lives, what changed over time — without ever rebuilding from scratch.

```
Ingest once → Store with metadata → Recall across sessions → Reflect into answers
```

***

## Features

- 🧠 **Persistent memory** — context survives restarts; no re-ingestion needed
- 📁 **Multi-format parsing** — understands `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.md`, `.pdf`, and more
- 🔍 **Contextual Q&A** — answers questions about structure, logic, and relationships across files
- ⚡ **Smart model routing** — lightweight lookups use fast models; complex synthesis routes to more capable ones
- 💬 **Chat interface** — clean sidebar + chat window UI built with React and Tailwind CSS
- 🔄 **Fallback-safe** — degrades gracefully if the memory service is unavailable
- 🗂 **Metadata-tagged chunks** — every chunk carries source, type, and ID for reliable retrieval and debugging

***

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + Vite + Tailwind CSS                 │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Sidebar    │  │     Chat Window      │  │
│  │ (sessions)   │  │  (Q&A interface)     │  │
│  └──────────────┘  └──────────────────────┘  │
└─────────────────────┬───────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────┐
│                  Backend                     │
│  Node.js + Express                           │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ File Parser  │  │   Memory Layer       │  │
│  │ (ingestor)   │  │  (Hindsight)         │  │
│  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────┐ │
│  │         Model Router (cascadeflow)        │ │
│  │  simple lookup → fast model               │ │
│  │  complex synthesis → capable model        │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**The key design decision** is keeping recall and answer generation as separate steps. Returning raw chunks is easy — it shifts the synthesis burden to the user. ContextCore handles that synthesis step so you get answers, not just file excerpts.

***

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- npm v9 or higher
- An API key for your chosen LLM provider

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/11DDBOY11/ContextCore.git
cd ContextCore
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**4. Configure environment variables**

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
OPENAI_API_KEY=your_api_key_here
MEMORY_STORE_PATH=./memory.json
```

### Running the App

**Start the backend server:**

```bash
cd backend
node server.js
```

**Start the frontend (in a separate terminal):**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

***

## Usage

### 1. Ingest a repository

Drop your project folder or paste a GitHub URL into the sidebar. ContextCore parses all supported files, creates metadata-tagged chunks, and stores them in the persistent memory layer.

### 2. Ask questions

Use the chat window to ask anything about the codebase:

```
"What does this project do?"
"How does the file parser work?"
"Where is authentication handled?"
"What's the relationship between server.js and the API routes?"
"Summarize the recent changes in the frontend."
```

### 3. Come back later

Close the app, restart it tomorrow — your memory is intact. No re-ingestion, no cold start.

***

## Project Structure

```
ContextCore/
├── backend/
│   ├── server.js          # Express server, API routes
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatWindow.jsx   # Main Q&A interface
    │   │   └── Sidebar.jsx      # Session + context management
    │   ├── api/                 # API client utilities
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

***

## Supported File Types

| Category | Extensions |
|---|---|
| JavaScript / TypeScript | `.js` `.ts` `.jsx` `.tsx` `.mjs` `.cjs` |
| Python | `.py` |
| Markup & Docs | `.md` `.mdx` `.txt` `.rst` |
| Config | `.json` `.yaml` `.yml` `.toml` `.env.example` |
| Documents | `.pdf` |

***

## What I Learned Building This

A few things that turned out to matter more than expected:

- **Metadata on every chunk is non-negotiable.** Without source file, chunk type, and chunk ID, debugging retrieval becomes painful fast. Tag everything upfront.
- **Recall and generation must be separate steps.** A single "retrieve + answer" pipeline works for demos but breaks under real questions. Keeping them separate lets you tune each step independently.
- **Model routing pays off quickly.** Not every question needs a powerful model. Routing simple lookups to a cheaper, faster model reduces latency and cost significantly.
- **Graceful degradation matters.** Build the fallback path before you think you need it.

***

## Contributing

Contributions, issues, and feature requests are welcome. Please open an issue before submitting a pull request for anything beyond small fixes.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
# Open a Pull Request
```

***

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

***

<div align="center">

Built with curiosity and frustration at tools that forget everything on restart.

⭐ **Star this repo** if you find it useful — it helps more engineers discover it.

</div>
