import React, { useState } from 'react'
import { ingestGithub, ingestFile } from '../api/ingest'

export default function Sidebar({ ingested, setIngested, setProjectName }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function handleIngest() {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repo URL')
      return
    }

    setLoading(true)
    setError('')
    setStatus('Connecting to backend...')

    try {
      setStatus('Resetting old data...')
      await fetch('/api/reset', { method: 'POST' })

      setStatus('Sending repo to backend...')
      const githubRes = await ingestGithub(repoUrl)

      setProjectName(repoUrl.split('/').filter(Boolean).pop() || 'Project')
      setIngested(true)
      setStatus(githubRes?.message || '✅ Knowledge base ready!')

      if (file) {
        setStatus('Embedding document...')
        await ingestFile(file)
        setStatus('✅ Knowledge base ready!')
      }
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Ingestion failed. Check backend.')
      setStatus('')
      setIngested(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside
      className="w-72 flex flex-col border-r p-5 gap-5 shrink-0"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="#4f98a3" />
          <path d="M7 14h4M17 14h4M14 7v4M14 17v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="14" r="3" stroke="white" strokeWidth="2" />
        </svg>
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
          ContextCore
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          GitHub Repo URL
        </label>
        <input
          type="text"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none border focus:border-teal-400 transition-colors"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Meeting Notes / Docs
        </label>
        <label
          className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm border cursor-pointer hover:border-teal-400 transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', borderStyle: 'dashed' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {file ? file.name : 'Upload .txt or .pdf'}
          <input type="file" accept=".txt,.pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
      </div>

      <button
        onClick={handleIngest}
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: loading ? 'var(--color-border)' : 'var(--color-primary)',
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : 'Build Knowledge Base'}
      </button>

      {status && <p className="text-xs text-center" style={{ color: 'var(--color-primary)' }}>{status}</p>}
      {error && <p className="text-xs text-center" style={{ color: '#e05c5c' }}>{error}</p>}

      {ingested && (
        <div
          className="mt-auto rounded-lg p-3 text-xs text-center"
          style={{ background: 'rgba(79,152,163,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(79,152,163,0.3)' }}
        >
          Knowledge base active 🟢
        </div>
      )}
    </aside>
  )
}