'use client'
import { useState } from 'react'
import { X, Check, Zap, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/plans'

export default function UpgradeModal({ reason, onClose }: { reason?: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function upgrade() {
    setLoading(true)
    const r = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'team' }) })
    const d = await r.json()
    if (d.url) window.location.href = d.url
    else setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid rgba(91,106,255,0.3)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 500, boxShadow: '0 0 60px rgba(91,106,255,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 19, marginBottom: 2 }}>Upgrade to Team</h2>
              <p style={{ color: '#4a5570', fontSize: 13 }}>$29.99/month · 14-day free trial</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5570' }}><X size={18} /></button>
        </div>

        {reason && (
          <div style={{ background: 'rgba(255,184,48,0.07)', border: '1px solid rgba(255,184,48,0.2)', borderRadius: 10, padding: '11px 14px', marginBottom: 20, fontSize: 13, color: '#fbbf24' }}>
            ⚡ {reason}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          <div style={{ gridColumn: '1 / -1', fontSize: 11, color: '#4a5570', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Everything in Team</div>
          {PLANS.team.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: '#8892aa' }}>
              <Check size={12} color="#00e5b0" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: 14, padding: '11px 18px' }}>Maybe later</button>
          <button onClick={upgrade} disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 14 }}>
            {loading ? 'Redirecting…' : <>Start 14-day trial <ArrowRight size={15} /></>}
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#2a3347' }}>No charge during trial · Cancel anytime</p>
      </div>
    </div>
  )
}
