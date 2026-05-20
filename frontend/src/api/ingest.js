import axios from 'axios'

const BASE = '/api'

export async function ingestGithub(repoUrl) {
  const res = await axios.post(`${BASE}/ingest/github`, { repoUrl })
  return res.data
}

export async function ingestFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`${BASE}/ingest/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}
