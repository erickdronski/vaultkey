'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Check, Copy, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState('')
  const [plan] = useState('Personal — Free Trial')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000) }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vaultkey-zeta.vercel.app'

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Settings</h1>
        <p style={{ color: '#4a5570', fontSize: 15 }}>Manage your account and integrations</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>
        {/* Account */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 15, marginBottom: 20 }}>Account</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <div style={{ color: '#f0f4ff', fontSize: 15 }}>{email || '—'}</div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#f0f4ff', fontSize: 15 }}>{plan}</span>
                <span className="pill pill-purple" style={{ fontSize: 11 }}>14 days remaining</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button className="btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>Upgrade plan</button>
            <button className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px', color: '#ff4757', borderColor: 'rgba(255,71,87,0.2)' }}>Delete account</button>
          </div>
        </div>

        {/* API Reference */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 15, marginBottom: 6 }}>API Reference</h2>
          <p style={{ color: '#4a5570', fontSize: 13, marginBottom: 20 }}>Two endpoints. That's all your agents need.</p>

          {[
            { method: 'POST', label: 'Authenticate agent', url: `${origin}/api/agent/auth`, body: '{"agent_key": "vk_sk_..."}', response: '{"token": "eyJ...", "expires_in": 3600}' },
            { method: 'POST', label: 'Retrieve secret', url: `${origin}/api/agent/secret`, body: '{"secret_name": "openai_key"}', response: '{"name": "openai_key", "value": "sk-..."}' },
            { method: 'GET/POST', label: 'MCP Server', url: `${origin}/api/mcp`, body: 'MCP JSON-RPC protocol', response: 'Compatible with Claude, GPT, etc.' },
          ].map(ep => (
            <div key={ep.label} style={{ marginBottom: 16, padding: 16, background: '#020409', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: ep.method.includes('MCP') ? 'rgba(0,229,176,0.1)' : 'rgba(91,106,255,0.1)', color: ep.method.includes('MCP') ? '#00e5b0' : '#818cf8', borderRadius: 5, padding: '3px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{ep.method}</span>
                  <span style={{ color: '#8892aa', fontSize: 13, fontWeight: 500, marginLeft: 8 }}>{ep.label}</span>
                </div>
                <button onClick={() => copy(ep.url, ep.label)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  {copied === ep.label ? <><Check size={11} color="#00e5b0" /> Copied</> : <><Copy size={11} /> Copy URL</>}
                </button>
              </div>
              <code style={{ color: '#5b6aff', fontSize: 12 }}>{ep.url}</code>
              <div style={{ marginTop: 8, color: '#4a5570', fontSize: 12, fontFamily: 'monospace' }}>
                <span style={{ color: '#2a3347' }}>Request:</span> {ep.body}
              </div>
              <div style={{ color: '#4a5570', fontSize: 12, fontFamily: 'monospace', marginTop: 2 }}>
                <span style={{ color: '#2a3347' }}>Response:</span> {ep.response}
              </div>
            </div>
          ))}
        </div>

        {/* MCP Config */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,229,176,0.15)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 15, marginBottom: 4 }}>MCP Integration</h2>
              <p style={{ color: '#4a5570', fontSize: 13 }}>Add VaultKey to Claude, GPT, or any MCP-compatible agent.</p>
            </div>
            <span className="pill pill-green" style={{ fontSize: 11 }}>Live</span>
          </div>
          <div style={{ background: '#020409', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ color: '#4a5570', fontSize: 11, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>claude_desktop_config.json</div>
            <pre style={{ color: '#86efac', fontSize: 12, lineHeight: 1.8, overflow: 'auto', margin: 0 }}>{JSON.stringify({
  mcpServers: {
    vaultkey: {
      command: "curl",
      args: ["-X", "POST", `${origin}/api/mcp`, "-H", "Authorization: Bearer vk_sk_your_key", "-H", "Content-Type: application/json"],
    }
  }
}, null, 2)}</pre>
          </div>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00e5b0', fontSize: 13, textDecoration: 'none' }}>
            <ExternalLink size={13} /> View full MCP docs
          </a>
        </div>
      </div>
    </div>
  )
}
