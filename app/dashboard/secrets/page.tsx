'use client'
import { useState } from 'react'
import { Plus, Trash2, Eye, EyeOff, Key, Copy, Check } from 'lucide-react'

const mockSecrets = [
  { id: '1', name: 'kalshi_api_key', description: 'Kalshi trading API', created_at: '2026-03-01', agents: 2 },
  { id: '2', name: 'openai_key', description: 'OpenAI API key', created_at: '2026-03-02', agents: 3 },
  { id: '3', name: 'beehiiv_key', description: 'Beehiiv newsletter API', created_at: '2026-03-05', agents: 1 },
  { id: '4', name: 'twitter_api_key', description: 'X / Twitter OAuth', created_at: '2026-03-07', agents: 1 },
  { id: '5', name: 'supabase_service_key', description: 'Supabase service role', created_at: '2026-03-09', agents: 2 },
]

export default function SecretsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [desc, setDesc] = useState('')
  const [showValue, setShowValue] = useState(false)
  const [copied, setCopied] = useState('')

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Secrets</h1>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>Encrypted credentials your agents can retrieve</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> Add Secret
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#a5b4fc' }}>
        🔐 Secret values are encrypted with AES-256-GCM. They are never shown after creation. Only your agents can retrieve them using their keys.
      </div>

      {/* Add Secret Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 16, padding: 32, width: 480, maxWidth: '90vw' }}>
            <h2 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Add Secret</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Name (used by agents)</label>
                <input className="input" placeholder="e.g. openai_key" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Secret Value</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showValue ? 'text' : 'password'} placeholder="sk-proj-..." value={value} onChange={e => setValue(e.target.value)} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowValue(!showValue)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Description (optional)</label>
                <input className="input" placeholder="What is this for?" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button className="btn-primary">Encrypt & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Secrets Table */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Name', 'Description', 'Agents with access', 'Created', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSecrets.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #1f2937' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'rgba(99,102,241,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={14} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ color: '#f9fafb', fontWeight: 500, fontSize: 14, fontFamily: 'monospace' }}>{s.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#9ca3af', fontSize: 14 }}>{s.description}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                    {s.agents} agent{s.agents !== 1 ? 's' : ''}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: 13 }}>{s.created_at}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleCopy(s.name)} style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#818cf8', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {copied === s.name ? <Check size={12} /> : <Copy size={12} />} {copied === s.name ? 'Copied' : 'Copy name'}
                    </button>
                    <button style={{ background: 'rgba(239,68,68,0.08)', border: 'none', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
