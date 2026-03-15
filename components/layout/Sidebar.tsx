'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Key, Shield, Bot, Activity, Settings, LogOut, CreditCard, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: Shield, exact: true },
  { href: '/dashboard/secrets', label: 'Secrets', icon: Key },
  { href: '/dashboard/agents', label: 'Agents', icon: Bot },
  { href: '/dashboard/logs', label: 'Logs', icon: Activity },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const bottomNav = [
  { href: '/docs', label: 'Docs', icon: BookOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{ width: 224, minHeight: '100vh', background: '#060b17', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #5b6aff, #7c3aed)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,106,255,0.4)' }}>
            <Key size={14} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#f0f4ff' }}>VaultKey</span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={15} /> {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 12px 0', borderTop: '1px solid var(--border)' }}>
        {bottomNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="sidebar-link" style={{ color: '#4a5570' }}>
            <Icon size={15} /> {label}
          </Link>
        ))}
        <button onClick={signOut} className="sidebar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: '#4a5570', marginTop: 2, marginBottom: 8 }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  )
}
