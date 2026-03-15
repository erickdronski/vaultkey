'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Key, Bot, Activity, TrendingUp, AlertTriangle, ArrowRight, Plus } from 'lucide-react'

type Stats = { secrets: number; agents: number; requests_today: number; success_rate: number }
type Log = { id: string; secret_name: string; success: boolean; error_reason?: string; accessed_at: string; agents: { name: string } | null }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/vault/stats').then(r => r.json()),
      fetch('/api/vault/logs?limit=8').then(r => r.json()),
    ]).then(([s, l]) => {
      setStats(s)
      setLogs(l.logs || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const failedLogs = logs.filter(l => !l.success)

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Overview</h1>
        <p style={{ color: '#4a5570', fontSize: 15 }}>Your vault at a glance</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Secrets', value: stats?.secrets ?? '—', icon: Key, color: '#5b6aff' },
          { label: 'Active agents', value: stats?.agents ?? '—', icon: Bot, color: '#7c3aed' },
          { label: 'Requests today', value: stats?.requests_today ?? '—', icon: Activity, color: '#00e5b0' },
          { label: 'Success rate', value: stats ? `${stats.success_rate}%` : '—', icon: TrendingUp, color: '#00e5b0' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <span style={{ color: '#4a5570', fontSize: 13 }}>{label}</span>
              <div style={{ width: 34, height: 34, background: `${color}14`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.03em' }}>
              {loading ? <span style={{ color: '#2a3347' }}>···</span> : value}
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {!loading && failedLogs.length > 0 && (
        <div style={{ background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={16} color="#ff4757" />
          <span style={{ color: '#ff6b7a', fontSize: 14 }}>
            <strong>{failedLogs.length} unauthorized access attempt{failedLogs.length > 1 ? 's' : ''}</strong> detected in recent logs
          </span>
          <Link href="/dashboard/logs" style={{ color: '#ff6b7a', fontSize: 13, textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            Review <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Quick start (if empty) */}
      {!loading && stats?.secrets === 0 && stats?.agents === 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(91,106,255,0.06), rgba(124,58,237,0.04))', border: '1px solid rgba(91,106,255,0.2)', borderRadius: 14, padding: 28, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
          <h3 style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 17, marginBottom: 8 }}>Your vault is ready</h3>
          <p style={{ color: '#8892aa', fontSize: 14, marginBottom: 20 }}>Add your first secret, then create an agent to access it.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/dashboard/secrets" className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
              <Plus size={14} /> Add a secret
            </Link>
            <Link href="/dashboard/agents" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border-light)', color: '#8892aa', textDecoration: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 14 }}>
              <Bot size={14} /> Create an agent
            </Link>
          </div>
        </div>
      )}

      {/* Recent logs */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f0f4ff' }}>Recent activity</h2>
          <Link href="/dashboard/logs" style={{ color: '#5b6aff', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#2a3347', fontSize: 14 }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
            <p style={{ color: '#4a5570', fontSize: 14 }}>No activity yet. Agents will appear here once they start accessing secrets.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Agent', 'Secret', 'Time', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 22px', textAlign: 'left', fontSize: 11, color: '#4a5570', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '13px 22px', fontSize: 14, color: '#f0f4ff', fontWeight: 500 }}>{(log.agents as { name: string } | null)?.name || 'unknown'}</td>
                  <td style={{ padding: '13px 22px', fontSize: 13, color: '#8892aa', fontFamily: 'monospace' }}>{log.secret_name}</td>
                  <td style={{ padding: '13px 22px', fontSize: 13, color: '#4a5570' }}>{new Date(log.accessed_at).toLocaleTimeString()}</td>
                  <td style={{ padding: '13px 22px' }}>
                    <span className={`pill ${log.success ? 'pill-green' : 'pill-red'}`} style={{ fontSize: 11 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: log.success ? '#00e5b0' : '#ff4757' }} />
                      {log.success ? 'success' : (log.error_reason || 'failed')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
