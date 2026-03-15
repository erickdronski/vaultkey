'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Key, ArrowRight, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import SocialAuth from '@/components/SocialAuth'

const PERKS = ['AES-256-GCM encrypted vault', 'Per-agent permission system', 'Full audit trail', '14-day free trial included']

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'rgba(0,229,176,0.1)', border: '2px solid rgba(0,229,176,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>🔐</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f0f4ff', marginBottom: 12, letterSpacing: '-0.02em' }}>Check your email</h1>
        <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.7, marginBottom: 8 }}>We sent a confirmation link to <strong style={{ color: '#f0f4ff' }}>{email}</strong></p>
        <p style={{ color: '#4a5570', fontSize: 14 }}>Click the link to activate your vault. Check spam if you don't see it within 2 minutes.</p>
        <div style={{ marginTop: 32 }}>
          <Link href="/login" style={{ color: '#5b6aff', fontSize: 14, textDecoration: 'none' }}>← Back to login</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(91,106,255,0.1) 0%, transparent 70%)', top: -200, right: -200, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,176,0.05) 0%, transparent 70%)', bottom: 0, left: 0, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(91,106,255,0.4)' }}>
              <Key size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#f0f4ff' }}>VaultKey</span>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f4ff', marginBottom: 6 }}>Create your vault</h1>
          <p style={{ color: '#8892aa', fontSize: 15 }}>14-day free trial · No credit card required</p>
        </div>

        {/* Perks strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {PERKS.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#8892aa' }}>
              <Check size={12} color="#00e5b0" style={{ flexShrink: 0, marginTop: 1 }} /> {p}
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={15} color="#ff4757" />
              <span style={{ color: '#ff6b7a', fontSize: 14 }}>{error}</span>
            </div>
          )}

          <SocialAuth mode="signup" />

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Email</label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="8+ characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? (strength <= 1 ? '#ff4757' : strength === 2 ? '#ffb830' : strength === 3 ? '#5b6aff' : '#00e5b0') : 'var(--border)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength <= 1 ? '#ff4757' : strength === 2 ? '#ffb830' : strength === 3 ? '#5b6aff' : '#00e5b0' }}>
                    {['', 'Weak', 'Fair', 'Good', 'Strong'][strength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating vault…' : <>Create my vault <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#4a5570', fontSize: 13, lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <a href="/terms" style={{ color: '#8892aa', textDecoration: 'none' }}>Terms</a> and{' '}
            <a href="/privacy" style={{ color: '#8892aa', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ color: '#4a5570', fontSize: 14 }}>Already have a vault? </span>
            <Link href="/login" style={{ color: '#5b6aff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
