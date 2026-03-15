'use client'
import Link from 'next/link'
import { Shield, Key, Activity, Lock, Zap, Users, Check, ArrowRight, Terminal } from 'lucide-react'

const BEFORE_CODE = `# Your agent's system prompt (dangerous ❌)
OPENAI_KEY = "sk-proj-abc123..."
KALSHI_KEY = "afe43c6f-494b..."
BEEHIIV_KEY = "1fepTWGx..."
# Stored in prompts, env files, git repos...`

const AFTER_CODE = `# With VaultKey (secure ✅)
import requests

def get_secret(name):
    r = requests.post(
      "https://vaultkey.app/api/agent/secret",
      headers={"Authorization": f"Bearer {AGENT_TOKEN}"},
      json={"secret_name": name}
    )
    return r.json()["value"]

OPENAI_KEY = get_secret("openai_key")
KALSHI_KEY = get_secret("kalshi_api_key")`

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1f2937', padding: '16px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#f9fafb' }}>VaultKey</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Pricing</Link>
            <Link href="#docs" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Docs</Link>
            <Link href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>Log in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '8px 18px', borderRadius: 8, background: '#6366f1', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: '#818cf8' }}>
          <Zap size={13} />
          Built for the autonomous agent era
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 800, lineHeight: 1.1, color: '#f9fafb', marginBottom: 24 }}>
          The password manager<br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>built for AI agents</span>
        </h1>
        <p style={{ fontSize: 20, color: '#9ca3af', lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Your agents need credentials. Don't hardcode them. VaultKey gives every agent its own identity, permissions, and secure access to your secrets.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6366f1', color: 'white', textDecoration: 'none', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 16 }}>
            Start 14-day free trial <ArrowRight size={16} />
          </Link>
          <Link href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#f9fafb', textDecoration: 'none', padding: '14px 28px', borderRadius: 10, fontWeight: 600, fontSize: 16, border: '1px solid #374151' }}>
            See how it works
          </Link>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 16 }}>No credit card required. Cancel anytime.</p>
      </section>

      {/* Problem / Solution */}
      <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f9fafb', marginBottom: 12 }}>Stop putting credentials everywhere</h2>
          <p style={{ color: '#9ca3af', fontSize: 18 }}>Agents shouldn't need to hardcode secrets. Here's the better way.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
              <span style={{ color: '#9ca3af', fontSize: 14 }}>Before — credentials scattered everywhere</span>
            </div>
            <pre style={{ color: '#f87171', fontSize: 13, lineHeight: 1.7, overflow: 'auto', margin: 0 }}>{BEFORE_CODE}</pre>
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ color: '#9ca3af', fontSize: 14 }}>After — agents authenticate, vault handles the rest</span>
            </div>
            <pre style={{ color: '#86efac', fontSize: 13, lineHeight: 1.7, overflow: 'auto', margin: 0 }}>{AFTER_CODE}</pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { icon: Shield, title: 'Zero-knowledge encryption', desc: 'AES-256-GCM encryption. We never see your secrets — even if our database is compromised, your credentials stay safe.' },
            { icon: Key, title: 'Per-agent permissions', desc: 'Each agent gets its own key and an explicit list of which secrets it can access. No agent gets more than it needs.' },
            { icon: Activity, title: 'Full audit trail', desc: 'Every secret retrieval is logged with agent ID, timestamp, IP address, and success/failure. Know exactly what your agents are doing.' },
            { icon: Lock, title: 'Instant revocation', desc: 'One click to revoke any agent\'s access. Set expiry dates. Compromised key? Revoke it in seconds.' },
            { icon: Zap, title: 'MCP compatible', desc: 'Native MCP server so any Model Context Protocol agent can authenticate and retrieve secrets without custom code.' },
            { icon: Terminal, title: 'Simple REST API', desc: 'Two endpoints. POST to auth, POST to retrieve. Works with Python, Node.js, curl — whatever your agent is built with.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 24 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color="#818cf8" />
              </div>
              <h3 style={{ fontWeight: 600, color: '#f9fafb', marginBottom: 8, fontSize: 16 }}>{title}</h3>
              <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f9fafb', marginBottom: 12 }}>Simple, transparent pricing</h2>
          <p style={{ color: '#9ca3af', fontSize: 18 }}>14-day free trial on all plans. No credit card required.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            {
              name: 'Personal', price: '$9.99', period: '/month',
              desc: 'Perfect for solo builders and indie hackers',
              features: ['5 agents', '50 secrets', 'Full audit log', 'REST API access', 'Email support'],
              cta: 'Start free trial', popular: false,
            },
            {
              name: 'Team', price: '$29', period: '/month',
              desc: 'For teams running multiple agent systems',
              features: ['20 agents', 'Unlimited secrets', 'Full audit log', 'REST API + MCP', 'Webhook alerts', 'Priority support'],
              cta: 'Start free trial', popular: true,
            },
            {
              name: 'Enterprise', price: '$99', period: '/month',
              desc: 'For companies with serious agent infrastructure',
              features: ['Unlimited agents', 'Unlimited secrets', 'SSO / SAML', 'Custom webhooks', 'IP allowlists', 'SLA + dedicated support'],
              cta: 'Contact us', popular: false,
            },
          ].map(plan => (
            <div key={plan.name} style={{
              background: plan.popular ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))' : '#111827',
              border: plan.popular ? '1px solid rgba(99,102,241,0.5)' : '1px solid #1f2937',
              borderRadius: 12, padding: 28, position: 'relative',
            }}>
              {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 12 }}>Most Popular</div>}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ color: '#6b7280', fontSize: 13 }}>{plan.desc}</p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#f9fafb' }}>{plan.price}</span>
                <span style={{ color: '#6b7280', fontSize: 14 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d1d5db', fontSize: 14 }}>
                    <Check size={14} color="#22c55e" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.popular ? '#6366f1' : 'transparent', color: plan.popular ? 'white' : '#f9fafb', border: plan.popular ? 'none' : '1px solid #374151', textDecoration: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '60px 40px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f9fafb', marginBottom: 16 }}>Ready to secure your agents?</h2>
          <p style={{ color: '#9ca3af', fontSize: 18, marginBottom: 32 }}>Join builders who've stopped hardcoding credentials.</p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6366f1', color: 'white', textDecoration: 'none', padding: '16px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16 }}>
            Start your free trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f2937', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={12} color="white" />
            </div>
            <span style={{ color: '#6b7280', fontSize: 13 }}>© 2026 VaultKey. One vault. Every agent. Zero leaks.</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Docs', 'Status'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>{item}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
