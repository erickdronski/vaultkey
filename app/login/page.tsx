'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Key, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import SocialAuth from '@/components/SocialAuth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(91,106,255,0.1) 0%, transparent 70%)', top: -200, left: -200, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%)', bottom: -100, right: -100, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(91,106,255,0.4)' }}>
              <Key size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#f0f4ff' }}>VaultKey</span>
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f4ff', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#8892aa', fontSize: 15 }}>Sign in to your vault</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={15} color="#ff4757" />
              <span style={{ color: '#ff6b7a', fontSize: 14 }}>{error}</span>
            </div>
          )}

          <SocialAuth mode="login" />

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#8892aa', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ color: '#8892aa', fontSize: 13, fontWeight: 500 }}>Password</label>
                <Link href="/forgot-password" style={{ color: '#5b6aff', fontSize: 13, textDecoration: 'none' }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ color: '#4a5570', fontSize: 14 }}>Don't have a vault? </span>
            <Link href="/signup" style={{ color: '#5b6aff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ color: '#2a3347', fontSize: 12 }}>🔐 Your secrets are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  )
}
