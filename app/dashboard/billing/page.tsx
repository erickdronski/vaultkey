'use client'
import { useState, useEffect } from 'react'
import { Check, Zap, ArrowRight, CreditCard, AlertTriangle, ExternalLink } from 'lucide-react'
import { PLANS } from '@/lib/plans'

type BillingStatus = {
  plan: 'personal' | 'team'
  status: string
  current_period_end: string | null
  stripe_customer_id: string | null
  usage: { secrets: number; agents: number }
}

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    fetch('/api/billing/status').then(r => r.json()).then(d => { setStatus(d); setLoading(false) })
  }, [])

  async function goToCheckout(plan: 'personal' | 'team') {
    setCheckoutLoading(true)
    const r = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
    const d = await r.json()
    if (d.url) window.location.href = d.url
    else setCheckoutLoading(false)
  }

  async function goToPortal() {
    setPortalLoading(true)
    const r = await fetch('/api/billing/portal', { method: 'POST' })
    const d = await r.json()
    if (d.url) window.location.href = d.url
    else setPortalLoading(false)
  }

  const currentPlan = status?.plan || 'personal'
  const currentLimits = PLANS[currentPlan].limits

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Billing</h1>
        <p style={{ color: '#4a5570', fontSize: 15 }}>Manage your plan and usage</p>
      </div>

      {/* Current plan card */}
      {!loading && status && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: '#4a5570', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Current plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#f0f4ff' }}>{PLANS[currentPlan].name}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff' }}>${PLANS[currentPlan].price}<span style={{ fontSize: 13, fontWeight: 400, color: '#4a5570' }}>/mo</span></span>
                <span className={`pill ${status.status === 'active' || status.status === 'trialing' ? 'pill-green' : 'pill-yellow'}`} style={{ fontSize: 11 }}>
                  {status.status === 'trialing' ? 'Free trial' : status.status === 'active' ? 'Active' : status.status}
                </span>
              </div>
              {status.current_period_end && (
                <div style={{ color: '#4a5570', fontSize: 13, marginTop: 6 }}>
                  {status.status === 'trialing' ? 'Trial ends' : 'Renews'}: {new Date(status.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>
            {status.stripe_customer_id && (
              <button onClick={goToPortal} disabled={portalLoading} className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ExternalLink size={13} /> {portalLoading ? 'Opening…' : 'Manage billing'}
              </button>
            )}
          </div>

          {/* Usage bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Secrets', used: status.usage.secrets, limit: currentLimits.secrets },
              { label: 'Agents', used: status.usage.agents, limit: currentLimits.agents },
            ].map(({ label, used, limit }) => {
              const pct = limit === Infinity ? 0 : Math.min(100, (used / (limit as number)) * 100)
              const warn = pct > 80
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                    <span style={{ color: '#8892aa' }}>{label}</span>
                    <span style={{ color: warn ? '#ffb830' : '#f0f4ff', fontWeight: 600 }}>
                      {used} / {limit === Infinity ? '∞' : limit}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: warn ? '#ffb830' : 'linear-gradient(90deg, #5b6aff, #7c3aed)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  {warn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 12, color: '#ffb830' }}>
                      <AlertTriangle size={11} /> Approaching limit
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Plan toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 8px' }}>
          <button onClick={() => setAnnual(false)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: !annual ? '#5b6aff' : 'transparent', color: !annual ? 'white' : '#4a5570', transition: 'all 0.2s', fontFamily: 'inherit' }}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: annual ? '#5b6aff' : 'transparent', color: annual ? 'white' : '#4a5570', transition: 'all 0.2s', fontFamily: 'inherit' }}>
            Annual <span style={{ color: '#00e5b0', fontSize: 11, marginLeft: 4 }}>-20%</span>
          </button>
        </div>
      </div>

      {/* Plan comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
        {(['personal', 'team'] as const).map(planId => {
          const plan = PLANS[planId]
          const isCurrent = currentPlan === planId
          const isUpgrade = planId === 'team' && currentPlan === 'personal'
          const monthlyPrice = annual ? (planId === 'personal' ? 7.99 : 23.99) : plan.price

          return (
            <div key={planId} style={{
              background: planId === 'team' ? 'linear-gradient(135deg, rgba(91,106,255,0.07), rgba(124,58,237,0.05))' : 'var(--bg-card)',
              border: `1px solid ${isCurrent ? 'rgba(0,229,176,0.3)' : planId === 'team' ? 'rgba(91,106,255,0.3)' : 'var(--border)'}`,
              borderRadius: 16, padding: 24, position: 'relative',
            }}>
              {isCurrent && (
                <div style={{ position: 'absolute', top: -11, left: 20, background: '#00e5b0', color: '#04060f', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, letterSpacing: '0.04em' }}>CURRENT PLAN</div>
              )}
              {isUpgrade && (
                <div style={{ position: 'absolute', top: -11, right: 20, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100 }}>RECOMMENDED</div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#f0f4ff', marginBottom: 2 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.04em' }}>${monthlyPrice}</span>
                  <span style={{ color: '#4a5570', fontSize: 13 }}>/mo</span>
                </div>
                {annual && <div style={{ fontSize: 12, color: '#00e5b0', marginTop: 2 }}>billed annually</div>}
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20, minHeight: 200 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#8892aa' }}>
                    <Check size={13} color="#00e5b0" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button disabled style={{ width: '100%', background: 'rgba(0,229,176,0.08)', border: '1px solid rgba(0,229,176,0.2)', color: '#00e5b0', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'default' }}>
                  ✓ Your current plan
                </button>
              ) : isUpgrade ? (
                <button onClick={() => goToCheckout('team')} disabled={checkoutLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                  {checkoutLoading ? 'Redirecting…' : <><Zap size={14} /> Upgrade to Team</>}
                </button>
              ) : (
                <button onClick={goToPortal} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                  Downgrade
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Feature comparison table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 600, color: '#f0f4ff', fontSize: 15 }}>Feature comparison</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, color: '#4a5570', fontWeight: 600 }}>Feature</th>
              <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 12, color: '#4a5570', fontWeight: 600 }}>Personal<br /><span style={{ color: '#8892aa', fontSize: 14, fontWeight: 700 }}>$9.99/mo</span></th>
              <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 12, color: '#5b6aff', fontWeight: 600 }}>Team<br /><span style={{ color: '#f0f4ff', fontSize: 14, fontWeight: 700 }}>$29.99/mo</span></th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Agents', '5', '25'],
              ['Secrets', '25', 'Unlimited'],
              ['API requests/day', '500', 'Unlimited'],
              ['Audit log retention', '30 days', '1 year'],
              ['REST API access', '✅', '✅'],
              ['MCP server', '❌', '✅'],
              ['Webhook alerts', '❌', '✅'],
              ['IP allowlisting', '❌', '✅'],
              ['Email support', '✅', '✅'],
              ['Priority support', '❌', '✅'],
            ].map(([feature, personal, team]) => (
              <tr key={feature} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '13px 24px', fontSize: 14, color: '#8892aa' }}>{feature}</td>
                <td style={{ padding: '13px 24px', textAlign: 'center', fontSize: 13, color: '#4a5570' }}>{personal}</td>
                <td style={{ padding: '13px 24px', textAlign: 'center', fontSize: 13, color: team === '❌' ? '#4a5570' : '#00e5b0', fontWeight: team === '❌' ? 400 : 600 }}>{team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 20px', background: 'rgba(91,106,255,0.05)', border: '1px solid rgba(91,106,255,0.15)', borderRadius: 12 }}>
        <CreditCard size={16} color="#818cf8" />
        <span style={{ color: '#8892aa', fontSize: 13 }}>All plans include a 14-day free trial. No charge until trial ends. Cancel anytime via billing portal.</span>
      </div>
    </div>
  )
}
