import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getPlan } from '@/lib/plans'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: sub } = await admin.from('subscriptions').select('*').eq('user_id', user.id).single()

  const planId = getPlan(sub?.plan)

  // Get usage counts
  const { data: vault } = await admin.from('vaults').select('id').eq('user_id', user.id).single()
  let secretCount = 0, agentCount = 0
  if (vault) {
    const [sc, ac] = await Promise.all([
      admin.from('secrets').select('id', { count: 'exact' }).eq('vault_id', vault.id),
      admin.from('agents').select('id', { count: 'exact' }).eq('vault_id', vault.id).eq('is_active', true),
    ])
    secretCount = sc.count || 0
    agentCount = ac.count || 0
  }

  return NextResponse.json({
    plan: planId,
    status: sub?.status || 'trialing',
    current_period_end: sub?.current_period_end || null,
    stripe_customer_id: sub?.stripe_customer_id || null,
    usage: { secrets: secretCount, agents: agentCount },
  })
}
