import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
