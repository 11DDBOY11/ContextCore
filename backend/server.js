import express from 'express'
import cors from 'cors'
import multer from 'multer'
import axios from 'axios'
import dotenv from 'dotenv'
import { fetchGithubData } from './github.js'
import { extractTextFromFile } from './fileParser.js'

dotenv.config()

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const AI_ENGINE = process.env.AI_ENGINE_URL || 'http://localhost:8000'

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.post('/api/ingest/github', async (req, res) => {
  try {
    const { repoUrl } = req.body
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl required' })

    console.log(`[GitHub] Fetching: ${repoUrl}`)
    const chunks = await fetchGithubData(repoUrl)
    console.log(`[GitHub] Got ${chunks.length} chunks`)

    res.json({ success: true, chunksEmbedded: chunks.length, status: 'processing' })

    axios.post(`${AI_ENGINE}/embed`, { chunks, source: 'github' })
      .then(r => console.log(`[GitHub] Embedded ${chunks.length} chunks`, r.data))
      .catch(err => console.error('[GitHub Embed Error]', err.message))
  } catch (err) {
    console.error('[GitHub Error]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/ingest/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    console.log(`[File] Processing: ${req.file.originalname}`)
    const text = await extractTextFromFile(req.file)
    const chunks = chunkText(text, req.file.originalname)
    console.log(`[File] Got ${chunks.length} chunks`)

    res.json({ success: true, chunksEmbedded: chunks.length, status: 'processing' })

    axios.post(`${AI_ENGINE}/embed`, { chunks, source: 'document' })
      .then(r => console.log(`[File] Embedded ${chunks.length} chunks`, r.data))
      .catch(err => console.error('[File Embed Error]', err.message))
  } catch (err) {
    console.error('[File Error]', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'question required' })

    console.log(`[Ask] "${question}"`)
    const response = await axios.post(`${AI_ENGINE}/ask`, { question })
    res.json(response.data)
  } catch (err) {
    console.error('[Ask Error]', err.message)
    res.status(500).json({ error: err.message })
  }
})

function chunkText(text, sourceName) {
  const words = text.split(/\s+/)
  const chunks = []
  let current = []

  for (const word of words) {
    current.push(word)
    if (current.join(' ').length >= 500) {
      chunks.push({ text: current.join(' '), source: sourceName })
      current = []
    }
  }
  if (current.length > 0) {
    chunks.push({ text: current.join(' '), source: sourceName })
  }
  return chunks
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`))