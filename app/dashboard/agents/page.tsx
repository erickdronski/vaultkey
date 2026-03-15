'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Bot, Power, Trash2, Copy, Check, X, AlertTriangle, Shield, Calendar } from 'lucide-react'

type Agent = { id: string; name: string; allowed_secrets: string[]; is_active: boolean; expires_at: string | null; created_at: string; last_used_at: string | null }

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520 }}>
        {children}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', allowed_secrets: '', expires_at: '' })

  const load = useCallback(async () => {
    const r = await fetch('/api/vault/agents')
    const d = await r.json()
    setAgents(d.agents || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const allowed = form.allowed_secrets.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    const body: Record<string, unknown> = { name: form.name.trim(), allowed_secrets: allowed }
    if (form.expires_at) body.expires_at = new Date(form.expires_at).toISOString()
    const r = await fetch('/api/vault/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { setError(d.error); setSaving(false); return }
    setAgents(a => [d.agent, ...a])
    setShowCreate(false)
    setNewKey({ key: d.agent_key, name: d.agent.name })
    setForm({ name: '', allowed_secrets: '', expires_at: '' })
    setSaving(false)
  }

  async function toggleAgent(id: string, current: boolean) {
    await fetch('/api/vault/agents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !current }) })
    setAgents(a => a.map(ag => ag.id === id ? { ...ag, is_active: !current } : ag))
  }

  async function deleteAgent(id: string) {
    if (!confirm('Delete this agent? This cannot be undone.')) return
    await fetch('/api/vault/agents', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setAgents(a => a.filter(ag => ag.id !== id))
  }

  const codeExample = newKey ? `import requests

# 1. Authenticate (once per session)
r = requests.post("${typeof window !== 'undefined' ? window.location.origin : ''}/api/agent/auth",
    json={"agent_key": "${newKey.key}"})
token = r.json()["token"]

# 2. Retrieve a secret
s = requests.post("${typeof window !== 'undefined' ? window.location.origin : ''}/api/agent/secret",
    headers={"Authorization": f"Bearer {token}"},
    json={"secret_name": "your_secret_name"})
value = s.json()["value"]` : ''

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Agents</h1>
          <p style={{ color: '#4a5570', fontSize: 15 }}>Each agent gets its own key and permission list</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px' }}>
          <Plus size={15} /> New agent
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 19 }}>Create agent</h2>
            <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, color: '#ff6b7a', fontSize: 14 }}>{error}</div>}
          <form onSubmit={createAgent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Agent name</label>
              <input className="input" placeholder="trading-bot" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>
                Allowed secrets <span style={{ color: '#4a5570' }}>(comma separated, or * for all)</span>
              </label>
              <input className="input" placeholder="kalshi_api_key, openai_key" value={form.allowed_secrets} onChange={e => setForm(f => ({ ...f, allowed_secrets: e.target.value }))} />
              <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>Leave empty = no access. Use <code style={{ color: '#818cf8' }}>*</code> to allow all secrets.</p>
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>
                Expiry date <span style={{ color: '#4a5570' }}>(optional)</span>
              </label>
              <input className="input" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost" style={{ fontSize: 14, padding: '10px 18px' }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Creating…' : 'Create agent'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New key reveal modal */}
      {newKey && (
        <Modal onClose={() => {}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255,184,48,0.1)', border: '1px solid rgba(255,184,48,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={22} color="#ffb830" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 18, marginBottom: 2 }}>Save your agent key now</h2>
              <p style={{ color: '#8892aa', fontSize: 13 }}>This is shown only once. We store a hash — the key cannot be recovered.</p>
            </div>
          </div>

          <div style={{ background: '#020409', border: '1px solid rgba(91,106,255,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <code style={{ color: '#a5b4fc', fontSize: 13, wordBreak: 'break-all', flex: 1 }}>{newKey.key}</code>
            <button onClick={() => copy(newKey.key)} style={{ background: 'rgba(91,106,255,0.12)', border: '1px solid rgba(91,106,255,0.2)', color: '#818cf8', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <div style={{ background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.18)', borderRadius: 9, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#fbbf24' }}>
            ⚠️ Store this in your agent's environment variables or config. We cannot recover it.
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#8892aa', fontSize: 12, marginBottom: 8, fontWeight: 600 }}>USAGE (Python):</p>
            <div className="code-block">
              <div style={{ padding: '14px 16px' }}>
                <pre style={{ color: '#86efac', fontSize: 12, lineHeight: 1.8, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{codeExample}</pre>
              </div>
            </div>
          </div>

          <button onClick={() => setNewKey(null)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Shield size={15} /> I've saved the key securely
          </button>
        </Modal>
      )}

      {/* Agents grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#2a3347' }}>Loading…</div>
      ) : agents.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <Bot size={36} color="#2a3347" style={{ marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, color: '#8892aa', fontSize: 16, marginBottom: 8 }}>No agents yet</h3>
          <p style={{ color: '#4a5570', fontSize: 14, marginBottom: 24 }}>Create your first agent to start securely retrieving secrets.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: 14 }}>
            <Plus size={14} /> Create first agent
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {agents.map(agent => {
            const expired = agent.expires_at && new Date(agent.expires_at) < new Date()
            return (
              <div key={agent.id} style={{ background: 'var(--bg-card)', border: `1px solid ${agent.is_active && !expired ? 'var(--border)' : 'rgba(255,71,87,0.15)'}`, borderRadius: 14, padding: 20, opacity: agent.is_active && !expired ? 1 : 0.75 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: agent.is_active ? 'rgba(91,106,255,0.1)' : 'rgba(107,114,128,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={17} color={agent.is_active ? '#818cf8' : '#4a5570'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 15 }}>{agent.name}</div>
                      <div style={{ color: '#4a5570', fontSize: 12 }}>
                        {agent.last_used_at ? `Used ${new Date(agent.last_used_at).toLocaleDateString()}` : 'Never used'}
                      </div>
                    </div>
                  </div>
                  <span className={`pill ${expired ? 'pill-red' : agent.is_active ? 'pill-green' : 'pill-red'}`} style={{ fontSize: 11 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: expired ? '#ff4757' : agent.is_active ? '#00e5b0' : '#ff4757' }} />
                    {expired ? 'Expired' : agent.is_active ? 'Active' : 'Revoked'}
                  </span>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#4a5570', fontSize: 12, marginBottom: 7, fontWeight: 500 }}>ALLOWED SECRETS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {agent.allowed_secrets.length === 0
                      ? <span style={{ color: '#2a3347', fontSize: 12 }}>No access</span>
                      : agent.allowed_secrets.includes('*')
                        ? <span style={{ background: 'rgba(255,184,48,0.08)', border: '1px solid rgba(255,184,48,0.2)', color: '#ffb830', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'monospace' }}>* all secrets</span>
                        : agent.allowed_secrets.map(s => (
                          <span key={s} style={{ background: 'rgba(91,106,255,0.07)', border: '1px solid rgba(91,106,255,0.15)', color: '#818cf8', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'monospace' }}>{s}</span>
                        ))
                    }
                  </div>
                </div>

                {agent.expires_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: expired ? '#ff4757' : '#4a5570', fontSize: 12, marginBottom: 12 }}>
                    <Calendar size={11} /> Expires {new Date(agent.expires_at).toLocaleDateString()}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => toggleAgent(agent.id, agent.is_active)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border-light)', color: '#8892aa', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    <Power size={12} /> {agent.is_active ? 'Revoke' : 'Restore'}
                  </button>
                  <button onClick={() => deleteAgent(agent.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.15)', color: '#ff4757', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
