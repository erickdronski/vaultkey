'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Shield, Key, Bot, Activity, Lock, ArrowRight, Check, ChevronDown, Terminal, Eye, EyeOff, Zap } from 'lucide-react'

// ─── Scroll animation hook ────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Typing effect ────────────────────────────────────────────────────────────
function useTyping(lines: string[], speed = 30) {
  const [displayed, setDisplayed] = useState<string[]>([''])
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (lineIdx >= lines.length) { setDone(true); return }
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => {
        setDisplayed(d => {
          const nd = [...d]
          nd[lineIdx] = (nd[lineIdx] || '') + lines[lineIdx][charIdx]
          return nd
        })
        setCharIdx(c => c + 1)
      }, speed)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setLineIdx(l => l + 1)
        setCharIdx(0)
        setDisplayed(d => [...d, ''])
      }, 180)
      return () => clearTimeout(t)
    }
  }, [lineIdx, charIdx, lines, speed, done])

  return { displayed, done }
}

// ─── Live log feed ────────────────────────────────────────────────────────────
const LOG_ENTRIES = [
  { agent: 'trading-bot', secret: 'kalshi_api_key', ok: true, ms: 12 },
  { agent: 'newsletter-agent', secret: 'beehiiv_key', ok: true, ms: 8 },
  { agent: 'x-bot', secret: 'twitter_api_key', ok: true, ms: 11 },
  { agent: 'unknown-process', secret: 'openai_key', ok: false, ms: 0 },
  { agent: 'trading-bot', secret: 'coinbase_secret', ok: true, ms: 9 },
  { agent: 'analysis-agent', secret: 'supabase_service_key', ok: true, ms: 14 },
]

function LiveLogFeed() {
  const [visible, setVisible] = useState<typeof LOG_ENTRIES>([])
  useEffect(() => {
    let i = 0
    const add = () => {
      if (i < LOG_ENTRIES.length) {
        setVisible(v => [...v, LOG_ENTRIES[i]])
        i++
        setTimeout(add, 600 + Math.random() * 800)
      } else {
        setTimeout(() => { setVisible([]); i = 0; setTimeout(add, 600) }, 2000)
      }
    }
    const t = setTimeout(add, 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {LOG_ENTRIES.map((entry, idx) => {
        const show = visible.includes(entry)
        return (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
            background: show ? (entry.ok ? 'rgba(0,229,176,0.05)' : 'rgba(255,71,87,0.05)') : 'transparent',
            border: `1px solid ${show ? (entry.ok ? 'rgba(0,229,176,0.15)' : 'rgba(255,71,87,0.15)') : 'rgba(255,255,255,0.03)'}`,
            borderRadius: 9, transition: 'all 0.4s ease', opacity: show ? 1 : 0.25,
          }}>
            <span style={{ fontSize: 11, color: show ? (entry.ok ? '#00e5b0' : '#ff4757') : '#2a3347', fontWeight: 700 }}>
              {entry.ok ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: 12, color: '#8892aa', flex: 1, fontFamily: 'monospace' }}>
              <span style={{ color: '#b8c5ff' }}>{entry.agent}</span>
              {' → '}<span style={{ color: '#f0f4ff' }}>{entry.secret}</span>
            </span>
            <span style={{ fontSize: 11, color: show && entry.ok ? '#4a5570' : 'transparent', fontFamily: 'monospace' }}>
              {entry.ms}ms
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal()
  const [showNav, setShowNav] = useState(false)
  const [annual, setAnnual] = useState(false)

  const terminalLines = [
    '# Agent retrieves credentials at runtime',
    'import vaultkey',
    '',
    'vault = vaultkey.connect("vk_sk_your_key")',
    'openai_key  = vault.get("openai_key")',
    'kalshi_key  = vault.get("kalshi_api_key")',
    'beehiiv_key = vault.get("beehiiv_key")',
    '',
    '# Zero plaintext. Full audit. Instant revoke.',
  ]
  const { displayed } = useTyping(terminalLines, 25)

  useEffect(() => {
    const handler = () => setShowNav(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', zIndex: 0 }}>
      <style>{`
        /* ── Global responsive overrides ── */
        .resp-two-col {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .resp-three-col {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .resp-four-col {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .resp-pricing {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .resp-two-col-60 {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .section-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 1024px) {
          .resp-three-col { grid-template-columns: 1fr 1fr !important; }
          .resp-two-col-60 { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          .resp-two-col { grid-template-columns: 1fr !important; }
          .resp-three-col { grid-template-columns: 1fr !important; }
          .resp-four-col { grid-template-columns: 1fr 1fr !important; }
          .resp-pricing { grid-template-columns: 1fr !important; }
          .resp-two-col-60 { grid-template-columns: 1fr !important; gap: 36px !important; }
          .section-pad { padding-top: 80px !important; padding-bottom: 80px !important; }
          .section-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .nav-desktop-links { display: none !important; }
          .comparison-table-wrap { display: none !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .resp-four-col { grid-template-columns: 1fr !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 24px',
        background: showNav ? 'rgba(4, 6, 15, 0.85)' : 'transparent',
        backdropFilter: showNav ? 'blur(20px)' : 'none',
        borderBottom: showNav ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #5b6aff 0%, #7c3aed 100%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(91,106,255,0.4)',
            }}>
              <Key size={15} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#f0f4ff' }}>VaultKey</span>
          </div>
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[['#how', 'How it works'], ['#pricing', 'Pricing'], ['#security', 'Security']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#8892aa', textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 7, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f4ff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892aa')}>{label}</a>
            ))}
            <Link href="/login" style={{ color: '#8892aa', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Sign in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
              Start free <ArrowRight size={14} />
            </Link>
          </div>
          {/* Mobile nav — just the CTA */}
          <div style={{ display: 'none' }} className="nav-mobile-cta">
            <Link href="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              Start free
            </Link>
          </div>
          <style>{`
            @media (max-width: 768px) {
              .nav-desktop-links { display: none !important; }
              .nav-mobile-cta { display: flex !important; }
            }
          `}</style>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        {/* Background orbs */}
        <div className="orb" style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(91,106,255,0.12) 0%, transparent 70%)', top: -200, left: -200 }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', top: 100, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%)', bottom: 0, left: '40%' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

        {/* Two-column grid — stacks on tablet/mobile */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 100px', position: 'relative', zIndex: 2 }}>
          <style>{`
            .hero-layout {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 60px;
              align-items: center;
            }
            @media (max-width: 1024px) {
              .hero-layout { grid-template-columns: 1fr; gap: 48px; }
              .hero-terminal-col { order: 2; }
              .hero-copy-col { order: 1; }
            }
            @media (max-width: 640px) {
              .hero-layout { gap: 36px; padding-top: 60px; }
              .hero-scroll-hint { display: none !important; }
            }
            .hero-h1 {
              font-size: clamp(38px, 5.5vw, 72px);
              font-weight: 900;
              line-height: 1.06;
              letter-spacing: -0.04em;
              margin-bottom: 24px;
              color: #f0f4ff;
            }
            .hero-sub {
              font-size: clamp(16px, 2vw, 20px);
              color: #8892aa;
              line-height: 1.7;
              margin-bottom: 36px;
              max-width: 520px;
            }
            .hero-btns {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              align-items: center;
            }
            .hero-trust {
              display: flex;
              gap: 20px;
              margin-top: 28px;
              flex-wrap: wrap;
            }
            .hero-mini-cards {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 12px;
            }
            @media (max-width: 480px) {
              .hero-btns { flex-direction: column; }
              .hero-btns a, .hero-btns button { width: 100%; justify-content: center; }
            }
          `}</style>

          <div className="hero-layout">
            {/* Left: copy */}
            <div className="hero-copy-col">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,176,0.08)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 28, fontSize: 12, color: '#00e5b0', fontWeight: 600, letterSpacing: '0.05em' }}>
                <span style={{ width: 6, height: 6, background: '#00e5b0', borderRadius: '50%' }} />
                NOW IN EARLY ACCESS
              </div>

              <h1 className="hero-h1">
                Your agents need<br />credentials.{' '}
                <span className="text-gradient">Don't hardcode them.</span>
              </h1>

              <p className="hero-sub">
                VaultKey is the secrets vault built for autonomous AI agents. Per-agent permissions. Zero-knowledge encryption. Full audit trail.
              </p>

              <div className="hero-btns">
                <Link href="/signup" className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
                  Get started free <ArrowRight size={16} />
                </Link>
                <a href="#how" className="btn-ghost" style={{ fontSize: 15, padding: '14px 28px' }}>
                  See how it works
                </a>
              </div>

              <div className="hero-trust">
                {['No credit card required', '14-day free trial', 'Cancel anytime'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4a5570', fontSize: 13 }}>
                    <Check size={12} color="#00e5b0" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: terminal */}
            <div className="hero-terminal-col float">
              <div className="code-block pulse-glow">
                <div className="code-block-header">
                  <div className="code-dot" style={{ background: '#ff4757' }} />
                  <div className="code-dot" style={{ background: '#ffb830' }} />
                  <div className="code-dot" style={{ background: '#00e5b0' }} />
                  <span style={{ color: '#4a5570', fontSize: 12, marginLeft: 8 }}>agent_init.py</span>
                </div>
                <div style={{ padding: '20px 22px', overflowX: 'auto' }}>
                  {displayed.map((line, i) => {
                    let color = '#8892aa'
                    if (line.startsWith('#')) color = '#4a5570'
                    else if (line.startsWith('import') || line.startsWith('from')) color = '#5b6aff'
                    else if (line.includes('vault.get(')) color = '#00e5b0'
                    else if (line.includes('=')) color = '#f0f4ff'
                    return (
                      <div key={i} style={{ color, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre' }}>
                        {line || ' '}
                        {i === displayed.length - 1 && <span className="cursor" style={{ borderRight: '2px solid #5b6aff', marginLeft: 1 }}> </span>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="hero-mini-cards">
                {[
                  { label: 'Encrypted at rest', icon: '🔐', sub: 'AES-256-GCM' },
                  { label: 'Access logged', icon: '📋', sub: 'Every request' },
                  { label: 'Instant revoke', icon: '⚡', sub: '1-click block' },
                  { label: 'MCP ready', icon: '🤖', sub: 'Claude & GPT' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(12,17,32,0.9)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', backdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f4ff' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#4a5570' }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="hero-scroll-hint" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#2a3347', marginTop: 60, animation: 'float 2s ease-in-out infinite' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>scroll</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </section>

      {/* ── Problem section ───────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }} id="how">
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,71,87,0.05) 0%, transparent 70%)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 12, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>The Problem</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#f0f4ff', marginBottom: 16 }}>
              You built a fleet of agents.<br />
              <span style={{ color: '#ff4757' }}>Now your credentials are everywhere.</span>
            </h2>
            <p style={{ color: '#8892aa', fontSize: 18, maxWidth: 540, margin: '0 auto' }}>
              System prompts. Env files. Git repos. Slack messages. Every agent you ship is a potential leak.
            </p>
          </div>

          {/* Before/After */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Before */}
            <div className="fade-up fade-up-delay-1">
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: '#ff4757', borderRadius: '50%' }} />
                <span style={{ color: '#8892aa', fontSize: 13, fontWeight: 500 }}>The way most people do it</span>
              </div>
              <div className="code-block" style={{ border: '1px solid rgba(255,71,87,0.15)' }}>
                <div className="code-block-header">
                  <div className="code-dot" style={{ background: '#ff4757' }} />
                  <div className="code-dot" style={{ background: '#ffb830' }} />
                  <div className="code-dot" style={{ background: '#4a5570' }} />
                  <span style={{ color: '#4a5570', fontSize: 12, marginLeft: 8 }}>agent_broken.py</span>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  {[
                    ['# 💀 Hardcoded in script', '#4a5570'],
                    ['OPENAI_KEY = "sk-proj-xK9mP2vQ..."', '#ff4757'],
                    ['', ''],
                    ['# 💀 Pasted in system prompt', '#4a5570'],
                    ['prompt = f"""You have access to:', '#8892aa'],
                    ['API_KEY={OPENAI_KEY}"""', '#ff4757'],
                    ['', ''],
                    ['# 💀 Committed to git accidentally', '#4a5570'],
                    ['# git log --all -S "sk-proj"', '#ff6b7a'],
                    ['# → 47 results found  🔥', '#ff4757'],
                  ].map(([line, color], i) => (
                    <div key={i} style={{ color, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre' }}>{line || ' '}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* After */}
            <div className="fade-up fade-up-delay-2">
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: '#00e5b0', borderRadius: '50%' }} />
                <span style={{ color: '#8892aa', fontSize: 13, fontWeight: 500 }}>With VaultKey</span>
              </div>
              <div className="code-block" style={{ border: '1px solid rgba(0,229,176,0.15)' }}>
                <div className="code-block-header">
                  <div className="code-dot" style={{ background: '#ff4757' }} />
                  <div className="code-dot" style={{ background: '#ffb830' }} />
                  <div className="code-dot" style={{ background: '#00e5b0' }} />
                  <span style={{ color: '#4a5570', fontSize: 12, marginLeft: 8 }}>agent_secure.py</span>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  {[
                    ['# ✅ Agent authenticates once', '#4a5570'],
                    ['vault = vaultkey.connect(AGENT_KEY)', '#f0f4ff'],
                    ['', ''],
                    ['# ✅ Gets exactly what it\'s allowed', '#4a5570'],
                    ['openai_key = vault.get("openai_key")', '#00e5b0'],
                    ['', ''],
                    ['# ✅ Every access is logged', '#4a5570'],
                    ['# agent=trading-bot secret=openai_key', '#4a5570'],
                    ['# ip=1.2.3.4 time=14:23:01 ✓ 12ms', '#00e5b0'],
                    ['# Revoke access in 1 click anytime', '#4a5570'],
                  ].map(([line, color], i) => (
                    <div key={i} style={{ color, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre' }}>{line || ' '}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: 'linear-gradient(180deg, transparent 0%, rgba(91,106,255,0.03) 50%, transparent 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 12, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4ff', marginBottom: 16 }}>
              Two API calls.<br />Complete security.
            </h2>
          </div>

          <div className="resp-three-col">
            {[
              {
                step: '01', icon: '🔑', title: 'Create your vault',
                desc: 'Sign up, add your secrets once. AES-256-GCM encrypted, we never store plaintext.',
                detail: 'Takes 2 minutes.',
              },
              {
                step: '02', icon: '🤖', title: 'Issue agent keys',
                desc: 'Create a key per agent with explicit permission lists. trading-bot gets kalshi_key. That\'s it.',
                detail: 'Principle of least privilege, built in.',
              },
              {
                step: '03', icon: '⚡', title: 'Agents pull at runtime',
                desc: 'Agent authenticates, gets a short-lived JWT, retrieves only its allowed secrets. Every request logged.',
                detail: 'No plaintext ever touches your code.',
              },
            ].map((item, i) => (
              <div key={item.step} className={`fade-up fade-up-delay-${i + 1}`}>
                <div className="card-glow" style={{ padding: 28, height: '100%' }}>
                  <div style={{ fontSize: 11, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20 }}>{item.step}</div>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: 19, color: '#f0f4ff', marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ color: '#8892aa', fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>{item.desc}</p>
                  <p style={{ color: '#00e5b0', fontSize: 12, fontWeight: 600 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live demo section ─────────────────────────────────────── */}
      <section style={{ padding: '120px 24px' }}>
        <div className="resp-two-col-60" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="fade-up">
            <div style={{ fontSize: 12, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Real-time audit</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4ff', marginBottom: 16, lineHeight: 1.2 }}>
              Watch your agents<br />in real time.
            </h2>
            <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
              Every secret retrieval is logged — agent name, IP address, timestamp, latency. Unauthorized access is blocked and flagged instantly.
            </p>
            <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
              If a key is compromised, revoke it in one click. The agent is locked out immediately. No credential rotation headache.
            </p>
            <Link href="/signup" className="btn-primary">
              See your vault <ArrowRight size={15} />
            </Link>
          </div>

          <div className="fade-up fade-up-delay-2">
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 14 }}>Live access feed</span>
                <span className="pill pill-green" style={{ fontSize: 11 }}>
                  <span style={{ width: 5, height: 5, background: '#00e5b0', borderRadius: '50%' }} />
                  LIVE
                </span>
              </div>
              <LiveLogFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── Security section ─────────────────────────────────────── */}
      <section id="security" style={{ padding: '120px 24px', position: 'relative' }}>
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,229,176,0.06) 0%, transparent 70%)', right: -100, top: '50%', transform: 'translateY(-50%)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="resp-two-col-60">
            <div className="fade-up">
              <div style={{ fontSize: 12, color: '#00e5b0', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Security first</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4ff', marginBottom: 16, lineHeight: 1.2 }}>
                Built like<br />the enterprise does it.<br />
                <span className="text-gradient-teal">Priced for builders.</span>
              </h2>
              <p style={{ color: '#8892aa', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                1Password's agent security starts at $19.95/user and requires their full enterprise stack. HashiCorp Vault requires a DevOps team to operate. VaultKey gives you the same security guarantees at $9.99/month.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['AES-256-GCM encryption at rest', 'Industry standard. Same as your bank.'],
                  ['Zero-knowledge architecture', 'Encrypted before it hits our DB. We can\'t read it.'],
                  ['bcrypt-hashed agent keys', 'Even we can\'t recover a lost key.'],
                  ['Short-lived JWT sessions', 'Auth tokens expire in 1 hour. Always fresh.'],
                  ['IP allowlisting per agent', 'Lock agents to specific servers or ranges.'],
                ].map(([title, sub]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Check size={10} color="#00e5b0" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 14 }}>{title}</div>
                      <div style={{ color: '#4a5570', fontSize: 13 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up fade-up-delay-2">
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Secrets protected', value: '∞', sub: 'Team plan' },
                  { label: 'Avg retrieval time', value: '~11ms', sub: 'Global edge' },
                  { label: 'Uptime SLA', value: '99.9%', sub: 'Enterprise plan' },
                  { label: 'Encryption rounds', value: '256-bit', sub: 'AES-GCM' },
                ].map(item => (
                  <div key={item.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#00e5b0', letterSpacing: '-0.03em', marginBottom: 4 }}>{item.value}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#4a5570' }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="card comparison-table-wrap" style={{ marginTop: 12, padding: 20 }}>
                <div style={{ fontSize: 12, color: '#4a5570', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Compared to alternatives</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['', '1Password', 'Vault', 'VaultKey'].map(h => (
                        <th key={h} style={{ textAlign: 'center', padding: '6px 8px', fontSize: 11, color: h === 'VaultKey' ? '#5b6aff' : '#4a5570', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['For solo devs', '❌', '❌', '✅'],
                      ['$9.99/mo', '❌', '❌', '✅'],
                      ['Easy setup', '⚠️', '❌', '✅'],
                      ['Agent-native', '⚠️', '❌', '✅'],
                    ].map(([label, ...vals]) => (
                      <tr key={label} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontSize: 12, color: '#8892aa' }}>{label}</td>
                        {vals.map((v, i) => (
                          <td key={i} style={{ textAlign: 'center', padding: '8px', fontSize: 13 }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '120px 24px', position: 'relative' }}>
        <div className="orb" style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(91,106,255,0.07) 0%, transparent 70%)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: '#5b6aff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4ff', marginBottom: 20 }}>
              Start free. Scale when ready.
            </h2>
            {/* Annual toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 8px' }}>
              <button onClick={() => setAnnual(false)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: !annual ? '#5b6aff' : 'transparent', color: !annual ? 'white' : '#4a5570', transition: 'all 0.2s' }}>Monthly</button>
              <button onClick={() => setAnnual(true)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: annual ? '#5b6aff' : 'transparent', color: annual ? 'white' : '#4a5570', transition: 'all 0.2s' }}>
                Annual <span style={{ color: '#00e5b0', fontSize: 11, marginLeft: 4 }}>-20%</span>
              </button>
            </div>
          </div>

          <div className="resp-pricing">
            {[
              {
                name: 'Personal', monthly: 9.99, annual: 7.99,
                desc: 'Solo builders & indie hackers',
                features: ['5 agents', '50 secrets', 'REST API', 'Audit log (30 days)', 'Email support'],
                cta: 'Start free trial', popular: false, color: '#8892aa',
              },
              {
                name: 'Team', monthly: 29, annual: 23,
                desc: 'Teams with serious agent infra',
                features: ['20 agents', 'Unlimited secrets', 'REST API + MCP server', 'Audit log (1 year)', 'Webhook alerts', 'Priority support'],
                cta: 'Start free trial', popular: true, color: '#5b6aff',
              },
              {
                name: 'Enterprise', monthly: 99, annual: 79,
                desc: 'Companies at scale',
                features: ['Unlimited agents', 'Unlimited secrets', 'SSO / SAML', 'IP allowlisting', 'Custom retention', 'SLA + dedicated Slack'],
                cta: 'Book a call', popular: false, color: '#8892aa',
              },
            ].map((plan, i) => (
              <div key={plan.name} className={`fade-up fade-up-delay-${i + 1}`} style={{ position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{
                  background: plan.popular ? 'linear-gradient(135deg, rgba(91,106,255,0.08), rgba(124,58,237,0.06))' : 'var(--bg-card)',
                  border: `1px solid ${plan.popular ? 'rgba(91,106,255,0.35)' : 'var(--border)'}`,
                  borderRadius: 16, padding: 28, height: '100%', display: 'flex', flexDirection: 'column',
                  boxShadow: plan.popular ? '0 0 40px rgba(91,106,255,0.1)' : 'none',
                }}>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, color: '#f0f4ff', marginBottom: 4 }}>{plan.name}</h3>
                    <p style={{ color: '#4a5570', fontSize: 13 }}>{plan.desc}</p>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.04em' }}>
                      ${annual ? plan.annual : plan.monthly}
                    </span>
                    <span style={{ color: '#4a5570', fontSize: 13 }}>/month</span>
                    {annual && <div style={{ fontSize: 12, color: '#00e5b0', marginTop: 4 }}>billed annually</div>}
                  </div>
                  <ul style={{ listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#8892aa' }}>
                        <Check size={14} color="#00e5b0" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" style={{
                    display: 'block', textAlign: 'center', textDecoration: 'none',
                    padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                    background: plan.popular ? 'linear-gradient(135deg, #5b6aff, #7c3aed)' : 'rgba(255,255,255,0.04)',
                    color: plan.popular ? 'white' : '#8892aa',
                    border: plan.popular ? 'none' : '1px solid var(--border)',
                    boxShadow: plan.popular ? '0 4px 16px rgba(91,106,255,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="fade-up" style={{ textAlign: 'center', color: '#4a5570', fontSize: 13, marginTop: 28 }}>
            All plans include a 14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="fade-up card-glow" style={{ padding: 'clamp(36px, 6vw, 70px) clamp(24px, 5vw, 48px)' }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(91,106,255,0.4)' }}>
              <Lock size={26} color="white" />
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4ff', marginBottom: 16, lineHeight: 1.2 }}>
              Your agents are running.<br />Are they running safely?
            </h2>
            <p style={{ color: '#8892aa', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
              Every day you wait is another day your credentials are scattered across system prompts, env files, and git commits. Fix it in 5 minutes.
            </p>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 17, padding: '16px 36px' }}>
              Create your vault — it's free <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={12} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f4ff' }}>VaultKey</div>
              <div style={{ fontSize: 11, color: '#4a5570' }}>One vault. Every agent. Zero leaks.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Privacy', 'Terms', 'Docs', 'Status', 'GitHub'].map(item => (
              <a key={item} href="#" style={{ color: '#4a5570', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#8892aa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a5570')}>{item}</a>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#2a3347' }}>© 2026 VaultKey</div>
        </div>
      </footer>
    </div>
  )
}
