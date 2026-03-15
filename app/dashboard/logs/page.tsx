'use client'
import { Activity, CheckCircle, XCircle, Filter } from 'lucide-react'

const logs = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  agent: ['trading-bot', 'newsletter-agent', 'x-bot', 'unknown-agent'][i % 4],
  secret: ['kalshi_api_key', 'beehiiv_key', 'twitter_api_key', 'openai_key', 'supabase_service_key'][i % 5],
  ip: ['192.168.1.1', '10.0.0.2', '172.16.0.1', '45.33.12.99'][i % 4],
  success: i !== 3 && i !== 11 && i !== 17,
  error: i === 3 ? 'not_authorized' : i === 11 ? 'key_expired' : i === 17 ? 'not_authorized' : null,
  time: `${Math.floor(i * 8.5)} min ago`,
}))

export default function LogsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Access Logs</h1>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>Every secret retrieval attempt by your agents</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #374151', color: '#9ca3af', borderRadius: 8, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}>
            <Filter size={14} /> Filter
          </button>
          <button style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: 8, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total today', value: '247', color: '#9ca3af' },
          { label: 'Successful', value: '244', color: '#22c55e' },
          { label: 'Failed', value: '3', color: '#ef4444' },
          { label: 'Unique agents', value: '3', color: '#818cf8' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '14px 20px', flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Status', 'Agent', 'Secret', 'IP Address', 'Time', 'Error'].map(h => (
                <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderTop: '1px solid #1f2937' }}>
                <td style={{ padding: '13px 20px' }}>
                  {log.success
                    ? <CheckCircle size={16} color="#22c55e" />
                    : <XCircle size={16} color="#ef4444" />}
                </td>
                <td style={{ padding: '13px 20px', color: '#f9fafb', fontSize: 14, fontWeight: 500 }}>{log.agent}</td>
                <td style={{ padding: '13px 20px', color: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}>{log.secret}</td>
                <td style={{ padding: '13px 20px', color: '#6b7280', fontSize: 13, fontFamily: 'monospace' }}>{log.ip}</td>
                <td style={{ padding: '13px 20px', color: '#6b7280', fontSize: 13 }}>{log.time}</td>
                <td style={{ padding: '13px 20px' }}>
                  {log.error && (
                    <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontFamily: 'monospace' }}>{log.error}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
