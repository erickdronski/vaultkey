'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Key, Copy, Check, X, RefreshCw } from 'lucide-react'

type Secret = { id: string; name: string; description: string | null; created_at: string; updated_at: string }

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
        {children}
      </div>
    </div>
  )
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', value: '', description: '' })

  const load = useCallback(async () => {
    const r = await fetch('/api/vault/secrets')
    const d = await r.json()
    setSecrets(d.secrets || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  async function addSecret(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const r = await fetch('/api/vault/secrets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setError(d.error || 'Failed to save'); setSaving(false); return }
    setSecrets(s => [d.secret, ...s])
    setShowAdd(false)
    setForm({ name: '', value: '', description: '' })
    setSaving(false)
  }

  async function deleteSecret(id: string) {
    setDeleting(id)
    await fetch('/api/vault/secrets', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSecrets(s => s.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Secrets</h1>
          <p style={{ color: '#4a5570', fontSize: 15 }}>Encrypted credentials your agents retrieve at runtime</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px' }}>
          <Plus size={15} /> Add secret
        </button>
      </div>

      {/* Security banner */}
      <div style={{ background: 'rgba(91,106,255,0.06)', border: '1px solid rgba(91,106,255,0.15)', borderRadius: 12, padding: '13px 18px', marginBottom: 24, fontSize: 13, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 10 }}>
        🔐 <span>All values are encrypted with <strong>AES-256-GCM</strong> before storage. Values are never shown after creation — not even to us.</span>
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 19 }}>Add secret</h2>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, color: '#ff6b7a', fontSize: 14 }}>{error}</div>}
          <form onSubmit={addSecret} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Secret name <span style={{ color: '#4a5570' }}>(used by agents to retrieve it)</span></label>
              <input className="input" placeholder="openai_key" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>Lowercase, underscores. Example: <code style={{ color: '#818cf8' }}>kalshi_api_key</code></p>
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Secret value <span style={{ color: '#ff4757' }}>*</span></label>
              <textarea className="input" placeholder="sk-proj-..." value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required style={{ height: 90, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
              <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>Encrypted immediately. Never retrievable via the UI again.</p>
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Description <span style={{ color: '#4a5570' }}>(optional)</span></label>
              <input className="input" placeholder="What is this for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost" style={{ fontSize: 14, padding: '10px 18px' }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Encrypting…' : '🔐 Encrypt & save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Secrets list */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#2a3347' }}>Loading…</div>
      ) : secrets.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <Key size={36} color="#2a3347" style={{ marginBottom: 16 }} />
          <h3 style={{ fontWeight: 600, color: '#8892aa', fontSize: 16, marginBottom: 8 }}>No secrets yet</h3>
          <p style={{ color: '#4a5570', fontSize: 14, marginBottom: 24 }}>Add your first secret to get started. Your agents will retrieve it at runtime.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ fontSize: 14 }}>
            <Plus size={14} /> Add your first secret
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Secret name', 'Description', 'Added', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 22px', textAlign: 'left', fontSize: 11, color: '#4a5570', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {secrets.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(91,106,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Key size={13} color="#818cf8" />
                      </div>
                      <code style={{ fontSize: 14, color: '#f0f4ff', fontWeight: 500 }}>{s.name}</code>
                    </div>
                  </td>
                  <td style={{ padding: '15px 22px', color: '#8892aa', fontSize: 14 }}>{s.description || <span style={{ color: '#2a3347' }}>—</span>}</td>
                  <td style={{ padding: '15px 22px', color: '#4a5570', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px 22px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => copy(s.name)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(91,106,255,0.08)', border: '1px solid rgba(91,106,255,0.15)', color: '#818cf8', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                        {copied === s.name ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy name</>}
                      </button>
                      <button onClick={() => deleteSecret(s.id)} disabled={deleting === s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.15)', color: '#ff4757', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>
                        {deleting === s.id ? <RefreshCw size={13} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
