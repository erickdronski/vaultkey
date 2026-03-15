'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Filter, RefreshCw } from 'lucide-react'

type Log = { id: string; secret_name: string; ip_address: string; success: boolean; error_reason: string | null; accessed_at: string; agents: { name: string } | null }

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    const r = await fetch('/api/vault/logs?limit=200')
    const d = await r.json()
    setLogs(d.logs || [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? logs : logs.filter(l => filter === 'success' ? l.success : !l.success)
  const successCount = logs.filter(l => l.success).length
  const failedCount = logs.filter(l => !l.success).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>Access logs</h1>
          <p style={{ color: '#4a5570', fontSize: 15 }}>Every secret retrieval attempt — real time</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1px solid var(--border-light)', color: '#8892aa', borderRadius: 9, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: logs.length, color: '#f0f4ff', bg: 'rgba(255,255,255,0.04)' },
          { label: 'Successful', value: successCount, color: '#00e5b0', bg: 'rgba(0,229,176,0.06)' },
          { label: 'Blocked', value: failedCount, color: '#ff4757', bg: 'rgba(255,71,87,0.06)' },
          { label: 'Success rate', value: logs.length > 0 ? `${Math.round(successCount / logs.length * 100)}%` : '—', color: '#818cf8', bg: 'rgba(91,106,255,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px', flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#4a5570', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['all', 'success', 'failed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderColor: filter === f ? 'rgba(91,106,255,0.4)' : 'var(--border)', background: filter === f ? 'rgba(91,106,255,0.1)' : 'transparent', color: filter === f ? '#818cf8' : '#4a5570', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f === 'success' ? `✓ Success (${successCount})` : `✗ Blocked (${failedCount})`}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#2a3347' }}>Loading logs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#4a5570', fontSize: 14 }}>{logs.length === 0 ? 'No access logs yet. Logs appear once agents start retrieving secrets.' : 'No logs match this filter.'}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['', 'Agent', 'Secret', 'IP', 'Time', 'Error'].map(h => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 11, color: '#4a5570', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderTop: '1px solid var(--border)', background: log.success ? 'transparent' : 'rgba(255,71,87,0.025)' }}>
                  <td style={{ padding: '12px 18px', width: 24 }}>
                    {log.success
                      ? <CheckCircle size={15} color="#00e5b0" />
                      : <XCircle size={15} color="#ff4757" />}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#f0f4ff', fontSize: 14, fontWeight: 500 }}>{(log.agents as { name: string } | null)?.name || 'unknown'}</td>
                  <td style={{ padding: '12px 18px', color: '#8892aa', fontSize: 13, fontFamily: 'monospace' }}>{log.secret_name}</td>
                  <td style={{ padding: '12px 18px', color: '#4a5570', fontSize: 12, fontFamily: 'monospace' }}>{log.ip_address || '—'}</td>
                  <td style={{ padding: '12px 18px', color: '#4a5570', fontSize: 12 }}>
                    {new Date(log.accessed_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {log.error_reason && (
                      <span style={{ background: 'rgba(255,71,87,0.08)', color: '#ff6b7a', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'monospace' }}>{log.error_reason}</span>
                    )}
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
