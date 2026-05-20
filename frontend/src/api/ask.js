import axios from 'axios'

const BASE = '/api'

export async function askQuestion(question) {
  const res = await axios.post(`${BASE}/ask`, { question })
  return res.data // { answer: "...", sources: ["commit: abc", "doc: line 12"] }
}
