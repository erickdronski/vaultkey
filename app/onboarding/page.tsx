'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, Bot, Check, ArrowRight, Copy, Shield, Zap } from 'lucide-react'

type Step = 'welcome' | 'add-secret' | 'create-agent' | 'key-reveal' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [secretName, setSecretName] = useState('')
  const [secretValue, setSecretValue] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentKey, setAgentKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const steps: Step[] = ['welcome', 'add-secret', 'create-agent', 'key-reveal', 'done']
  const stepIdx = steps.indexOf(step)
  const progress = ((stepIdx) / (steps.length - 1)) * 100

  async function addSecret() {
    setSaving(true); setError('')
    const r = await fetch('/api/vault/secrets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: secretName, value: secretValue, description: 'Added during onboarding' }) })
    const d = await r.json()
    if (!r.ok) { setError(d.error || d.message); setSaving(false); return }
    setSaving(false)
    setStep('create-agent')
  }

  async function createAgent() {
    setSaving(true); setError('')
    const r = await fetch('/api/vault/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: agentName, allowed_secrets: [secretName.toLowerCase().replace(/\s+/g, '_')] }) })
    const d = await r.json()
    if (!r.ok) { setError(d.error || d.message); setSaving(false); return }
    setAgentKey(d.agent_key)
    setSaving(false)
    setStep('key-reveal')
  }

  const copy = () => { navigator.clipboard.writeText(agentKey); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const STEP_CONTENT: Record<Step, React.ReactNode> = {
    welcome: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(91,106,255,0.4)' }}>
          <Key size={30} color="white" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Your vault is ready 🎉
        </h1>
        <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
          Let's get your first secret secured and your first agent connected. Takes 2 minutes.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
          {[
            { icon: '🔐', label: 'Add a secret', sub: '30 seconds' },
            { icon: '🤖', label: 'Create an agent', sub: '30 seconds' },
            { icon: '⚡', label: 'Start retrieving', sub: 'Instantly' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(91,106,255,0.06)', border: '1px solid rgba(91,106,255,0.15)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#4a5570' }}>{item.sub}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setStep('add-secret')} className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
          Let's go <ArrowRight size={16} />
        </button>
        <div style={{ marginTop: 16 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#4a5570', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            Skip — I'll explore on my own
          </button>
        </div>
      </div>
    ),

    'add-secret': (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(91,106,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={20} color="#818cf8" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 20, marginBottom: 2 }}>Add your first secret</h2>
            <p style={{ color: '#4a5570', fontSize: 14 }}>This is the credential your agents will retrieve securely.</p>
          </div>
        </div>
        {error && <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, color: '#ff6b7a', fontSize: 14 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Secret name <span style={{ color: '#4a5570' }}>(what agents call it)</span></label>
            <input className="input" placeholder="openai_key" value={secretName} onChange={e => setSecretName(e.target.value)} />
            <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>Lowercase, underscores. Try: <code style={{ color: '#818cf8' }}>openai_key</code>, <code style={{ color: '#818cf8' }}>kalshi_api_key</code></p>
          </div>
          <div>
            <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Secret value</label>
            <textarea className="input" placeholder="Paste your API key here..." value={secretValue} onChange={e => setSecretValue(e.target.value)} style={{ height: 80, resize: 'none', fontFamily: 'monospace', fontSize: 13 }} />
            <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>🔐 Encrypted with AES-256-GCM immediately. Never shown again.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setStep('welcome')} className="btn-ghost" style={{ fontSize: 14 }}>← Back</button>
            <button onClick={addSecret} disabled={!secretName || !secretValue || saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: (!secretName || !secretValue || saving) ? 0.6 : 1 }}>
              {saving ? 'Encrypting…' : 'Encrypt & save secret →'}
            </button>
          </div>
        </div>
      </div>
    ),

    'create-agent': (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(0,229,176,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#00e5b0" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 20, marginBottom: 2 }}>Create your first agent</h2>
            <p style={{ color: '#4a5570', fontSize: 14 }}>This agent will get access to <code style={{ color: '#818cf8', fontSize: 13 }}>{secretName || 'your secret'}</code></p>
          </div>
        </div>
        <div style={{ background: 'rgba(0,229,176,0.05)', border: '1px solid rgba(0,229,176,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#8892aa', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="#00e5b0" />
          Secret saved! AES-256-GCM encrypted. Now let's create an agent with permission to access it.
        </div>
        {error && <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, color: '#ff6b7a', fontSize: 14 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#8892aa', fontSize: 13, marginBottom: 7 }}>Agent name</label>
            <input className="input" placeholder="my-trading-bot" value={agentName} onChange={e => setAgentName(e.target.value)} />
            <p style={{ color: '#4a5570', fontSize: 12, marginTop: 5 }}>Name it after what this agent does. You can create more later.</p>
          </div>
          <div style={{ background: 'rgba(91,106,255,0.05)', border: '1px solid rgba(91,106,255,0.15)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#4a5570', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Will have access to</div>
            <span style={{ background: 'rgba(91,106,255,0.1)', border: '1px solid rgba(91,106,255,0.2)', color: '#818cf8', borderRadius: 6, padding: '4px 10px', fontSize: 13, fontFamily: 'monospace' }}>{secretName || 'your_secret'}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setStep('add-secret')} className="btn-ghost" style={{ fontSize: 14 }}>← Back</button>
            <button onClick={createAgent} disabled={!agentName || saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: (!agentName || saving) ? 0.6 : 1 }}>
              {saving ? 'Creating…' : 'Create agent →'}
            </button>
          </div>
        </div>
      </div>
    ),

    'key-reveal': (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,184,48,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} color="#ffb830" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 20, marginBottom: 4 }}>Your agent key — save it now</h2>
            <p style={{ color: '#8892aa', fontSize: 14 }}>This is shown once. We store a hash — cannot be recovered.</p>
          </div>
        </div>

        <div style={{ background: '#020409', border: '1px solid rgba(91,106,255,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <code style={{ color: '#a5b4fc', fontSize: 13, flex: 1, wordBreak: 'break-all' }}>{agentKey}</code>
          <button onClick={copy} style={{ background: 'rgba(91,106,255,0.12)', border: '1px solid rgba(91,106,255,0.2)', color: '#818cf8', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#8892aa', fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: '0.04em' }}>USAGE IN YOUR AGENT:</p>
          <div style={{ background: '#020409', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '16px 18px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9 }}>
            {[
              ['import requests', '#5b6aff'],
              ['', ''],
              ['# Step 1: Get a session token', '#4a5570'],
              [`r = requests.post("https://vaultkey-zeta.vercel.app/api/agent/auth",`, '#f0f4ff'],
              [`    json={"agent_key": "${agentKey.slice(0,20)}..."})`, '#f0f4ff'],
              ['token = r.json()["token"]', '#00e5b0'],
              ['', ''],
              ['# Step 2: Retrieve your secret', '#4a5570'],
              [`s = requests.post("https://vaultkey-zeta.vercel.app/api/agent/secret",`, '#f0f4ff'],
              ['    headers={"Authorization": f"Bearer {token}"},', '#f0f4ff'],
              [`    json={"secret_name": "${secretName || 'your_secret'}"})`, '#f0f4ff'],
              [`value = s.json()["value"]  # Your decrypted secret`, '#00e5b0'],
            ].map(([line, color], i) => (
              <div key={i} style={{ color, whiteSpace: 'pre-wrap' }}>{line || ' '}</div>
            ))}
          </div>
        </div>

        <button onClick={() => setStep('done')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
          <Check size={16} /> I've saved the key — let's go!
        </button>
      </div>
    ),

    done: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 14 }}>You're all set!</h2>
        <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          Your secret is encrypted, your agent is live, and your vault is ready to scale. Add more secrets and agents from the dashboard.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto 24px' }}>
          {[
            '✅ First secret encrypted',
            '✅ First agent created',
            '✅ Ready to retrieve credentials',
          ].map(item => (
            <div key={item} style={{ background: 'rgba(0,229,176,0.06)', border: '1px solid rgba(0,229,176,0.15)', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: '#00e5b0', textAlign: 'left' }}>{item}</div>
          ))}
        </div>
        <button onClick={() => router.push('/dashboard')} className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
          Go to dashboard <ArrowRight size={16} />
        </button>
      </div>
    ),
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(91,106,255,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={12} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#f0f4ff' }}>VaultKey</span>
          </div>
          {step !== 'done' && (
            <span style={{ color: '#4a5570', fontSize: 13 }}>Step {stepIdx + 1} of {steps.length - 1}</span>
          )}
        </div>

        {/* Progress bar */}
        {step !== 'done' && (
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #5b6aff, #7c3aed)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 36 }}>
          {STEP_CONTENT[step]}
        </div>
      </div>
    </div>
  )
}
