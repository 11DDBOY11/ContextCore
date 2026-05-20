import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const HEADERS = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json'
}

const CODE_EXTENSIONS = /\.(html?|jsx?|tsx?|py|php|java|dart|cs|cpp|c|go|rb|vue|svelte|sql|json|yaml|yml|css|scss|sass|env\.example|md|txt)$/i
const SKIP_PATHS = /node_modules|dist|build|\.git|__pycache__|\.next|\.vite|coverage|vendor|public\/assets/i

export async function fetchGithubData(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match.map(s => s.replace(/\.git$/, ''))
  const BASE = `https://api.github.com/repos/${owner}/${repo}`
  const chunks = []

  try {
    const readme = await axios.get(`${BASE}/readme`, { headers: HEADERS })
    const content = Buffer.from(readme.data.content, 'base64').toString('utf-8')
    chunks.push({ text: `README:\n${content.slice(0, 5000)}`, source: 'README.md', type: 'meta' })
    console.log('[GitHub] README fetched')
  } catch (e) { console.log('[GitHub] No README') }

  try {
    const commits = await axios.get(`${BASE}/commits?per_page=30`, { headers: HEADERS })
    const commitText = commits.data.map(c =>
      `Commit ${c.sha.slice(0,7)} by ${c.commit.author.name}: ${c.commit.message.split('\n')[0]}`
    ).join('\n')
    chunks.push({ text: `Git Commit History:\n${commitText}`, source: 'git-commits', type: 'meta' })
    console.log('[GitHub] Commits fetched')
  } catch (e) { console.log('[GitHub] No commits') }

  try {
    const issues = await axios.get(`${BASE}/issues?per_page=30&state=all`, { headers: HEADERS })
    const issueText = issues.data.map(i =>
      `#${i.number} [${i.state}] ${i.title}\n${(i.body || '').slice(0, 300)}`
    ).join('\n\n')
    chunks.push({ text: `Issues & Pull Requests:\n${issueText}`, source: 'github-issues', type: 'meta' })
    console.log('[GitHub] Issues fetched')
  } catch (e) { console.log('[GitHub] No issues') }

  try {
    const treeRes = await axios.get(`${BASE}/git/trees/HEAD?recursive=1`, { headers: HEADERS })
    const allFiles = treeRes.data.tree.filter(f => {
      if (f.type !== 'blob') return false
      if (SKIP_PATHS.test(f.path)) { console.log(`[GitHub] SKIPPED (path): ${f.path}`); return false }
      if (!CODE_EXTENSIONS.test(f.path)) { console.log(`[GitHub] SKIPPED (ext): ${f.path}`); return false }
      if (f.size > 100000) { console.log(`[GitHub] SKIPPED (size): ${f.path}`); return false }
      return true
    })

    console.log(`[GitHub] Found ${allFiles.length} code files to read`)

    const BATCH_SIZE = 5
    const MAX_FILES = 80

    for (let i = 0; i < Math.min(allFiles.length, MAX_FILES); i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (file) => {
        try {
          const res = await axios.get(`${BASE}/contents/${file.path}`, { headers: HEADERS })
          const content = Buffer.from(res.data.content, 'base64').toString('utf-8')
          chunks.push(...chunkFileContent(content, file.path))
        } catch (e) { console.log(`[GitHub] Could not read ${file.path}`) }
      }))
      if (i + BATCH_SIZE < Math.min(allFiles.length, MAX_FILES)) {
        await new Promise(r => setTimeout(r, 150))
      }
    }
    console.log(`[GitHub] Total chunks: ${chunks.length}`)
  } catch (e) { console.log('[GitHub] File tree error:', e.message) }

  return chunks
}

function chunkFileContent(content, filePath) {
  const lines = content.split('\n')
  const chunks = []
  let current = [], charCount = 0

  for (const line of lines) {
    current.push(line)
    charCount += line.length
    if (charCount >= 800) {
      chunks.push({ text: `File: ${filePath}\n${current.join('\n')}`, source: filePath, type: 'code' })
      current = []; charCount = 0
    }
  }
  if (current.length > 0)
    chunks.push({ text: `File: ${filePath}\n${current.join('\n')}`, source: filePath, type: 'code' })

  return chunks
}