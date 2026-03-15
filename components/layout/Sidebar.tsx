'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Key, Shield, Bot, Activity, Settings, LogOut } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: Shield },
  { href: '/dashboard/secrets', label: 'Secrets', icon: Key },
  { href: '/dashboard/agents', label: 'Agents', icon: Bot },
  { href: '/dashboard/logs', label: 'Access Logs', icon: Activity },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: '#0d1117', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0 }}>
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #1f2937' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={15} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f9fafb' }}>VaultKey</span>
        </Link>
      </div>
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: active ? '#818cf8' : '#9ca3af',
              fontWeight: active ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '20px 12px', borderTop: '1px solid #1f2937' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', width: '100%' }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
