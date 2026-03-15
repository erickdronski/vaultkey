'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Key, Copy, Check } from 'lucide-react'

const BASE = 'https://vaultkey-zeta.vercel.app'

function CodeBlock({ code, lang = 'python' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div className="code-block">
        <div className="code-block-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="code-dot" style={{ background: '#ff4757' }} />
            <div className="code-dot" style={{ background: '#ffb830' }} />
            <div className="code-dot" style={{ background: '#00e5b0' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#4a5570', fontSize: 11 }}>{lang}</span>
            <button onClick={copy} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a5570', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>
        </div>
        <div style={{ padding: '18px 20px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#86efac', fontFamily: 'monospace', whiteSpace: 'pre' }}>{code}</pre>
        </div>
      </div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 64, paddingTop: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </section>
  )
}

function Param({ name, type, required, children }: { name: string; type: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ minWidth: 160 }}>
        <code style={{ color: '#a5b4fc', fontSize: 13 }}>{name}</code>
        {required && <span style={{ marginLeft: 6, fontSize: 10, color: '#ff4757', fontWeight: 700, background: 'rgba(255,71,87,0.1)', padding: '1px 5px', borderRadius: 3 }}>required</span>}
        <div style={{ color: '#4a5570', fontSize: 11, marginTop: 2 }}>{type}</div>
      </div>
      <div style={{ color: '#8892aa', fontSize: 13, lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<'python' | 'node' | 'curl'>('python')

  const authSnippets = {
    python: `import requests

r = requests.post("${BASE}/api/agent/auth",
    json={"agent_key": "vk_sk_your_agent_key_here"})

data = r.json()
token = data["token"]
# token expires in 3600 seconds (1 hour)`,

    node: `const r = await fetch("${BASE}/api/agent/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ agent_key: "vk_sk_your_agent_key_here" })
})

const { token } = await r.json()
// Cache this token — reuse for 1 hour`,

    curl: `curl -X POST "${BASE}/api/agent/auth" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_key": "vk_sk_your_agent_key_here"}'

# Response:
# { "token": "eyJ...", "agent_id": "...", "expires_in": 3600 }`,
  }

  const retrieveSnippets = {
    python: `import requests

def get_secret(token, name):
    r = requests.post("${BASE}/api/agent/secret",
        headers={"Authorization": f"Bearer {token}"},
        json={"secret_name": name})
    
    if r.status_code == 200:
        return r.json()["value"]
    raise Exception(f"Error: {r.json()['error']}")

openai_key = get_secret(token, "openai_key")
kalshi_key = get_secret(token, "kalshi_api_key")`,

    node: `async function getSecret(token, name) {
  const r = await fetch("${BASE}/api/agent/secret", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${token}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ secret_name: name })
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error)
  return data.value
}

const openaiKey = await getSecret(token, "openai_key")`,

    curl: `curl -X POST "${BASE}/api/agent/secret" \\
  -H "Authorization: Bearer eyJ..." \\
  -H "Content-Type: application/json" \\
  -d '{"secret_name": "openai_key"}'

# Response:
# { "name": "openai_key", "value": "sk-proj-..." }`,
  }

  const mcpSnippet = `{
  "mcpServers": {
    "vaultkey": {
      "url": "${BASE}/api/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer vk_sk_your_agent_key"
      }
    }
  }
}`

  const fullExample = `import requests
import os

# ─── VaultKey integration ─────────────────────────────────────
AGENT_KEY = os.environ["VAULTKEY_AGENT_KEY"]  # Only this one env var

_token = None
_token_expiry = 0

def get_token():
    global _token, _token_expiry
    import time
    if _token and time.time() < _token_expiry - 60:
        return _token
    r = requests.post("${BASE}/api/agent/auth",
        json={"agent_key": AGENT_KEY})
    data = r.json()
    _token = data["token"]
    _token_expiry = time.time() + data["expires_in"]
    return _token

def secret(name):
    r = requests.post("${BASE}/api/agent/secret",
        headers={"Authorization": f"Bearer {get_token()}"},
        json={"secret_name": name})
    return r.json()["value"]

# ─── Use in your agent ────────────────────────────────────────
openai_key  = secret("openai_key")
kalshi_key  = secret("kalshi_api_key")
beehiiv_key = secret("beehiiv_key")
# ... and so on. All fetched fresh from the vault, never hardcoded.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', position: 'sticky', top: 0, background: 'rgba(4,6,15,0.9)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={12} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#f0f4ff' }}>VaultKey</span>
            <span style={{ color: '#4a5570', fontSize: 14 }}>/ Docs</span>
          </Link>
          <Link href="/dashboard" style={{ color: '#5b6aff', fontSize: 13, textDecoration: 'none' }}>→ Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
        {/* Sidebar TOC */}
        <aside style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <div style={{ fontSize: 11, color: '#4a5570', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>On this page</div>
          {[
            ['#overview', 'Overview'],
            ['#quickstart', 'Quickstart'],
            ['#auth', 'Authentication'],
            ['#retrieve', 'Retrieve Secrets'],
            ['#errors', 'Error Reference'],
            ['#mcp', 'MCP Server'],
            ['#best-practices', 'Best Practices'],
            ['#sdks', 'SDKs & Examples'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ display: 'block', color: '#4a5570', textDecoration: 'none', fontSize: 13, padding: '5px 0', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8892aa')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4a5570')}>{label}</a>
          ))}
        </aside>

        {/* Content */}
        <main>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>API Reference</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.03em', marginBottom: 16 }}>VaultKey Documentation</h1>
            <p style={{ color: '#8892aa', fontSize: 17, lineHeight: 1.7 }}>
              VaultKey gives your AI agents a secure way to retrieve credentials at runtime. Two endpoints, zero hardcoded secrets.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <p style={{ color: '#8892aa', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>VaultKey works by issuing each agent its own key with explicit permissions. When the agent runs, it authenticates and retrieves only the secrets it's allowed to access. Every request is logged.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { title: 'Zero plaintext', desc: 'Secrets encrypted with AES-256-GCM. Never in logs or prompts.' },
                { title: 'Per-agent keys', desc: 'Each agent has its own key and allowlist. Revoke instantly.' },
                { title: 'Full audit trail', desc: 'Every access logged with agent, time, IP, and result.' },
              ].map(item => (
                <div key={item.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ color: '#4a5570', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="quickstart" title="Quickstart">
            <p style={{ color: '#8892aa', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>Get your first secret in 3 steps.</p>
            {[
              '1. Add a secret at /dashboard/secrets (e.g. openai_key)',
              '2. Create an agent at /dashboard/agents — grant access to openai_key',
              '3. Copy the agent key (shown once), use it below:',
            ].map(s => <p key={s} style={{ color: '#8892aa', fontSize: 14, marginBottom: 8 }}>→ {s}</p>)}
            <CodeBlock lang="python" code={fullExample} />
          </Section>

          <Section id="auth" title="Authentication">
            <p style={{ color: '#8892aa', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
              Exchange your agent key for a short-lived JWT. The JWT is valid for 1 hour — cache it and reuse across requests. Only make a new auth call when the token expires.
            </p>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: 'rgba(91,106,255,0.1)', color: '#818cf8', borderRadius: 5, padding: '3px 9px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>POST</span>
                <code style={{ color: '#f0f4ff', fontSize: 14 }}>/api/agent/auth</code>
                <span style={{ marginLeft: 'auto', color: '#4a5570', fontSize: 12 }}>No auth required</span>
              </div>
              <div>
                <div style={{ padding: '12px 20px', fontSize: 12, color: '#4a5570', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>REQUEST BODY</div>
                <Param name="agent_key" type="string" required>Your agent key starting with <code style={{ color: '#818cf8' }}>vk_sk_</code>. Issued once when you create an agent.</Param>
                <div style={{ padding: '12px 20px', fontSize: 12, color: '#4a5570', fontWeight: 600, borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>RESPONSE</div>
                <Param name="token" type="string">JWT bearer token. Use as <code style={{ color: '#818cf8' }}>Authorization: Bearer {'{'}token{'}'}</code></Param>
                <Param name="expires_in" type="number">Seconds until expiry. Always 3600 (1 hour).</Param>
                <Param name="agent_id" type="string">UUID of the authenticated agent.</Param>
              </div>
            </div>

            {/* Language tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(['python', 'node', 'curl'] as const).map(lang => (
                <button key={lang} onClick={() => setActiveLang(lang)} style={{ padding: '5px 14px', borderRadius: 7, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'monospace', borderColor: activeLang === lang ? 'rgba(91,106,255,0.4)' : 'var(--border)', background: activeLang === lang ? 'rgba(91,106,255,0.1)' : 'transparent', color: activeLang === lang ? '#818cf8' : '#4a5570' }}>
                  {lang}
                </button>
              ))}
            </div>
            <CodeBlock lang={activeLang} code={authSnippets[activeLang]} />
          </Section>

          <Section id="retrieve" title="Retrieve Secrets">
            <p style={{ color: '#8892aa', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
              Retrieve a secret by name. The agent must have been granted explicit permission to access it. Unauthorized requests return a 403 and are logged.
            </p>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: 'rgba(91,106,255,0.1)', color: '#818cf8', borderRadius: 5, padding: '3px 9px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>POST</span>
                <code style={{ color: '#f0f4ff', fontSize: 14 }}>/api/agent/secret</code>
                <span style={{ marginLeft: 'auto', color: '#4a5570', fontSize: 12 }}>Requires Bearer token</span>
              </div>
              <div>
                <div style={{ padding: '12px 20px', fontSize: 12, color: '#4a5570', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>REQUEST BODY</div>
                <Param name="secret_name" type="string" required>The exact name of the secret as saved in your vault (e.g. <code style={{ color: '#818cf8' }}>openai_key</code>).</Param>
                <div style={{ padding: '12px 20px', fontSize: 12, color: '#4a5570', fontWeight: 600, borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>RESPONSE</div>
                <Param name="name" type="string">The secret name.</Param>
                <Param name="value" type="string">The decrypted secret value.</Param>
              </div>
            </div>

            <CodeBlock lang={activeLang} code={retrieveSnippets[activeLang]} />
          </Section>

          <Section id="errors" title="Error Reference">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['HTTP Status', 'Error Code', 'Description', 'Fix'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#4a5570', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['401', 'invalid_key', 'Agent key not found or wrong format', 'Check your vk_sk_ key is correct'],
                    ['401', 'invalid_token', 'JWT expired or malformed', 'Re-authenticate to get a fresh token'],
                    ['401', 'key_expired', 'Agent key expiry date passed', 'Issue a new key or update expiry in dashboard'],
                    ['403', 'not_authorized', 'Agent not allowed to access this secret', 'Add the secret to the agent\'s allowlist'],
                    ['403', 'agent_revoked', 'Agent has been revoked', 'Re-enable or create a new agent'],
                    ['404', 'not_found', 'Secret name doesn\'t exist in vault', 'Check the exact name matches vault'],
                    ['500', 'server_error', 'Internal server error', 'Retry. Contact support if persists'],
                  ].map(([status, code, desc, fix]) => (
                    <tr key={code} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: parseInt(status) >= 400 ? '#ff6b7a' : '#00e5b0', fontFamily: 'monospace', fontWeight: 600 }}>{status}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#818cf8', fontFamily: 'monospace' }}>{code}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#8892aa' }}>{desc}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a5570' }}>{fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="mcp" title="MCP Server (Team plan)">
            <div style={{ background: 'rgba(0,229,176,0.05)', border: '1px solid rgba(0,229,176,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#8892aa' }}>
              🤖 The MCP server lets Claude, GPT, and any Model Context Protocol-compatible agent retrieve secrets <strong style={{ color: '#f0f4ff' }}>without writing custom auth code</strong>. Available on the Team plan.
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: 'rgba(0,229,176,0.1)', color: '#00e5b0', borderRadius: 5, padding: '3px 9px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>GET / POST</span>
                <code style={{ color: '#f0f4ff', fontSize: 14 }}>/api/mcp</code>
              </div>
              <div style={{ padding: '14px 20px', color: '#8892aa', fontSize: 13, lineHeight: 1.7 }}>
                Implements MCP protocol version <code style={{ color: '#818cf8' }}>2024-11-05</code> over HTTP. Auth via <code style={{ color: '#818cf8' }}>Authorization: Bearer vk_sk_...</code> header. Available tools: <code style={{ color: '#818cf8' }}>get_secret</code>, <code style={{ color: '#818cf8' }}>list_secrets</code>.
              </div>
            </div>

            <p style={{ color: '#8892aa', fontSize: 14, marginBottom: 12 }}>Add to your Claude Desktop config:</p>
            <CodeBlock lang="json" code={mcpSnippet} />
          </Section>

          <Section id="best-practices" title="Best Practices">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Cache the auth token', desc: 'The JWT lasts 1 hour. Cache it in memory and only re-authenticate when it expires. Don\'t call /auth on every secret retrieval.' },
                { title: 'Use descriptive secret names', desc: 'Names like openai_key, kalshi_api_key are clear. Agents calling vault.get("k") will confuse your future self.' },
                { title: 'Principle of least privilege', desc: 'Give each agent only the secrets it needs. trading-bot shouldn\'t have access to beehiiv_key. Separate them.' },
                { title: 'Set expiry dates on agent keys', desc: 'For temporary automations or contractors, set an expiry. Keys auto-revoke when the date passes.' },
                { title: 'Monitor your logs', desc: 'Check /dashboard/logs regularly. Unexpected secrets being requested = potential compromise. Revoke immediately.' },
                { title: 'Never log secret values', desc: 'Even though VaultKey decrypts for you, don\'t print or log the returned value. Treat it like a password.' },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ width: 6, height: 6, background: '#00e5b0', borderRadius: '50%', flexShrink: 0, marginTop: 7 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 14, marginBottom: 4 }}>{title}</div>
                    <div style={{ color: '#8892aa', fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="sdks" title="SDKs & Examples">
            <p style={{ color: '#8892aa', fontSize: 15, marginBottom: 20 }}>Official SDKs coming soon. For now, use the REST API directly — it's two endpoints.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { lang: 'Python', status: 'REST API', code: '~10 lines', icon: '🐍' },
                { lang: 'Node.js', status: 'REST API', code: '~10 lines', icon: '🟩' },
                { lang: 'Go', status: 'Coming soon', code: 'SDK Q2 2026', icon: '🐹' },
                { lang: 'Rust', status: 'Coming soon', code: 'SDK Q2 2026', icon: '🦀' },
              ].map(item => (
                <div key={item.lang} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 24 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 14 }}>{item.lang}</div>
                    <div style={{ fontSize: 12, color: item.status.includes('Coming') ? '#4a5570' : '#00e5b0' }}>{item.status} · {item.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
