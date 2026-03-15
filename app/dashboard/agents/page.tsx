'use client'
import { useState } from 'react'
import { Plus, Bot, Power, Trash2, Copy, Check, AlertTriangle } from 'lucide-react'

const mockAgents = [
  { id: '1', name: 'trading-bot', allowed_secrets: ['kalshi_api_key', 'coinbase_secret'], is_active: true, last_used_at: '2 min ago', expires_at: null, created_at: '2026-03-01' },
  { id: '2', name: 'newsletter-agent', allowed_secrets: ['beehiiv_key', 'openai_key'], is_active: true, last_used_at: '14 min ago', expires_at: '2026-06-01', created_at: '2026-03-05' },
  { id: '3', name: 'x-bot', allowed_secrets: ['twitter_api_key'], is_active: true, last_used_at: '28 min ago', expires_at: null, created_at: '2026-03-07' },
  { id: '4', name: 'old-scraper', allowed_secrets: ['openai_key'], is_active: false, last_used_at: '3 days ago', expires_at: null, created_at: '2026-02-10' },
]

export default function AgentsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const newKey = 'vk_sk_xK9mP2vQrT8nLjH5wYcA3dEsF7bG4iNu'

  const handleCopy = () => {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Agents</h1>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>Manage which agents can access your vault</p>
        </div>
        <button onClick={() => { setShowAdd(true); setShowKey('new') }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <Plus size={16} /> New Agent
        </button>
      </div>

      {/* New Key Warning Modal */}
      {showKey && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 16, padding: 32, width: 520, maxWidth: '90vw' }}>
            {showAdd ? (
              <>
                <h2 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Create Agent</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Agent Name</label>
                    <input className="input" placeholder="e.g. trading-bot" />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Allowed Secrets</label>
                    <input className="input" placeholder="kalshi_api_key, openai_key (comma separated)" />
                    <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>Leave empty for no access. Use * for all secrets.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Expires (optional)</label>
                    <input className="input" type="date" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowAdd(false); setShowKey(null) }} className="btn-secondary">Cancel</button>
                  <button onClick={() => setShowAdd(false)} className="btn-primary">Create Agent</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(245,158,11,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={20} color="#f59e0b" />
                  </div>
                  <div>
                    <h2 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 18, marginBottom: 2 }}>Save your agent key now</h2>
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>This key will never be shown again</p>
                  </div>
                </div>
                <div style={{ background: '#0a0e1a', border: '1px solid #374151', borderRadius: 8, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <code style={{ color: '#a5b4fc', fontSize: 13, wordBreak: 'break-all' }}>{newKey}</code>
                  <button onClick={handleCopy} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', color: '#818cf8', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#fbbf24' }}>
                  ⚠️ Store this key securely — in your agent's environment variables or OpenClaw config. We store only a hash of this key and cannot recover it.
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8 }}>Usage in Python:</p>
                  <pre style={{ background: '#0a0e1a', border: '1px solid #374151', borderRadius: 8, padding: 14, fontSize: 12, color: '#86efac', overflow: 'auto', margin: 0 }}>{`import requests

# Authenticate
r = requests.post("https://vaultkey.app/api/agent/auth",
    json={"agent_key": "${newKey}"})
token = r.json()["token"]

# Get a secret
s = requests.post("https://vaultkey.app/api/agent/secret",
    headers={"Authorization": f"Bearer {token}"},
    json={"secret_name": "openai_key"})
key = s.json()["value"]`}</pre>
                </div>
                <button onClick={() => setShowKey(null)} className="btn-primary" style={{ width: '100%' }}>I've saved the key</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Agents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {mockAgents.map(agent => (
          <div key={agent.id} style={{ background: '#111827', border: `1px solid ${agent.is_active ? '#1f2937' : 'rgba(239,68,68,0.15)'}`, borderRadius: 12, padding: 20, opacity: agent.is_active ? 1 : 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, background: agent.is_active ? 'rgba(99,102,241,0.1)' : 'rgba(107,114,128,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color={agent.is_active ? '#818cf8' : '#6b7280'} />
                </div>
                <div>
                  <div style={{ color: '#f9fafb', fontWeight: 600, fontSize: 15 }}>{agent.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Last used {agent.last_used_at}</div>
                </div>
              </div>
              <span style={{ background: agent.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: agent.is_active ? '#22c55e' : '#6b7280', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                {agent.is_active ? 'Active' : 'Revoked'}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Allowed secrets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.allowed_secrets.map(s => (
                  <span key={s} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontFamily: 'monospace' }}>{s}</span>
                ))}
              </div>
            </div>
            {agent.expires_at && (
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Expires: {agent.expires_at}</div>
            )}
            <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #1f2937' }}>
              <button style={{ flex: 1, background: 'transparent', border: '1px solid #374151', color: '#9ca3af', borderRadius: 7, padding: '8px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Power size={13} /> {agent.is_active ? 'Revoke' : 'Restore'}
              </button>
              <button style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: 7, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
