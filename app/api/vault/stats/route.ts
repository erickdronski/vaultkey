import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = await createAdminClient()
  const { data: vault } = await admin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ secrets: 0, agents: 0, requests_today: 0, success_rate: 100 })

  const today = new Date(); today.setHours(0,0,0,0)
  const [secretsRes, agentsRes, logsRes] = await Promise.all([
    admin.from('secrets').select('id', { count: 'exact' }).eq('vault_id', vault.id),
    admin.from('agents').select('id', { count: 'exact' }).eq('vault_id', vault.id).eq('is_active', true),
    admin.from('access_logs').select('success').eq('vault_id', vault.id).gte('accessed_at', today.toISOString()),
  ])

  const logs = logsRes.data || []
  const successCount = logs.filter(l => l.success).length
  const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100 * 10) / 10 : 100

  return NextResponse.json({
    secrets: secretsRes.count || 0,
    agents: agentsRes.count || 0,
    requests_today: logs.length,
    success_rate: successRate,
  })
}
