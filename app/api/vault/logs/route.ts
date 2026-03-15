import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = await createAdminClient()
  const { data: vault } = await admin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ logs: [] })
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const agentFilter = url.searchParams.get('agent_id')
  let query = admin
    .from('access_logs')
    .select('id, agent_id, secret_name, ip_address, success, error_reason, accessed_at, agents(name)')
    .eq('vault_id', vault.id)
    .order('accessed_at', { ascending: false })
    .limit(limit)
  if (agentFilter) query = query.eq('agent_id', agentFilter)
  const { data: logs } = await query
  return NextResponse.json({ logs: logs || [] })
}
