import React, { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../api/ask'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
          style={{ background: 'var(--color-primary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="5" stroke="white" strokeWidth="2" />
            <path d="M7 14h3M18 14h3M14 7v3M14 18v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <div
        className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={{
          background: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isUser ? 'white' : 'var(--color-text)',
          border: isUser ? 'none' : '1px solid var(--color-border)'
        }}
      >
        <p>{msg.content}</p>

        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-3 pt-3 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Sources
            </p>
            {msg.sources.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md inline-block"
                style={{ background: 'rgba(79,152,163,0.2)', color: 'var(--color-primary)' }}
              >
                📄 {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatWindow({ ingested, projectName }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 Hi! Ingest a GitHub repo on the left to get started. Then ask me anything about your project — decisions, architecture, authentication flow, anything.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (ingested) {
      setMessages([
        {
          role: 'assistant',
          content: `✅ Knowledge base ready for "${projectName}"! Ask me anything — "Why was this architecture chosen?", "What does the auth module do?", "What was decided in the meeting?"`
        }
      ])
    }
  }, [ingested, projectName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    if (!ingested) {
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: '⚠️ Please build the knowledge base first by entering a GitHub URL on the left.'
        }
      ])
      return
    }

    const question = input
    setMessages(m => [...m, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await askQuestion(question)
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources || []
        }
      ])
    } catch (e) {
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: '❌ Error getting answer. Make sure the AI engine is running.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex flex-col flex-1 h-screen overflow-hidden">
      <div
        className="px-6 py-4 border-b shrink-0 flex items-center gap-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div>
          <h1 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
            {ingested ? `📁 ${projectName}` : 'ContextCore'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {ingested ? 'Knowledge base active — ask anything' : 'The project memory layer'}
          </p>
        </div>

        {ingested && (
          <span
            className="ml-auto text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: 'rgba(79,152,163,0.15)', color: 'var(--color-primary)' }}
          >
            ● Live
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'white' }} />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex gap-3 items-end rounded-xl p-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <textarea
            rows={1}
            placeholder={ingested ? 'Ask anything about your project...' : 'Ingest a repo first...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
            style={{ color: 'var(--color-text)', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-lg p-2 transition-all shrink-0"
            style={{
              background: !loading && input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
              cursor: !loading && input.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-center mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  )
}