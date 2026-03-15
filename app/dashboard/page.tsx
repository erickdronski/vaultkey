'use client'
import { Shield, Key, Bot, Activity, TrendingUp, AlertCircle } from 'lucide-react'

const stats = [
  { label: 'Total Secrets', value: '12', icon: Key, change: '+2 this week' },
  { label: 'Active Agents', value: '4', icon: Bot, change: '1 used today' },
  { label: 'Requests Today', value: '247', icon: Activity, change: '+18% vs yesterday' },
  { label: 'Success Rate', value: '99.6%', icon: TrendingUp, change: 'All time' },
]

const recentLogs = [
  { agent: 'trading-bot', secret: 'kalshi_api_key', time: '2 min ago', status: 'success', ip: '192.168.1.1' },
  { agent: 'newsletter-agent', secret: 'beehiiv_key', time: '14 min ago', status: 'success', ip: '10.0.0.2' },
  { agent: 'x-bot', secret: 'twitter_api_key', time: '28 min ago', status: 'success', ip: '172.16.0.1' },
  { agent: 'unknown-agent', secret: 'openai_key', time: '1 hour ago', status: 'failed', ip: '45.33.12.99' },
  { agent: 'trading-bot', secret: 'coinbase_secret', time: '2 hours ago', status: 'success', ip: '192.168.1.1' },
]

export default function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Overview</h1>
        <p style={{ color: '#9ca3af', fontSize: 15 }}>Your vault at a glance</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(({ label, value, icon: Icon, change }) => (
          <div key={label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ color: '#9ca3af', fontSize: 13 }}>{label}</span>
              <div style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color="#818cf8" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{change}</div>
          </div>
        ))}
      </div>

      {/* Alert if any failed */}
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertCircle size={16} color="#ef4444" />
        <span style={{ color: '#fca5a5', fontSize: 14 }}>
          <strong>1 unauthorized access attempt</strong> detected 1 hour ago from IP 45.33.12.99
        </span>
      </div>

      {/* Recent Access Logs */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f9fafb' }}>Recent Activity</h2>
          <a href="/dashboard/logs" style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Agent', 'Secret', 'Time', 'IP', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log, i) => (
              <tr key={i} style={{ borderTop: '1px solid #1f2937' }}>
                <td style={{ padding: '14px 24px', fontSize: 14, color: '#f9fafb', fontWeight: 500 }}>{log.agent}</td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#9ca3af', fontFamily: 'monospace' }}>{log.secret}</td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#6b7280' }}>{log.time}</td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>{log.ip}</td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: log.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: log.status === 'success' ? '#22c55e' : '#ef4444'
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: log.status === 'success' ? '#22c55e' : '#ef4444' }} />
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
