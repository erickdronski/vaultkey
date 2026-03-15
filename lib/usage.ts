/**
 * Usage enforcement — called from API routes to check plan limits
 */
import { getPlan, isAtLimit, canUseFeature, type PlanId } from './plans'

export async function getUserPlan(userId: string): Promise<PlanId> {
  const { createAdminClient } = await import('./supabase-server')
  const admin = await createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  // Active or trialing = use their plan. Otherwise downgrade to personal.
  if (!data || (data.status !== 'active' && data.status !== 'trialing')) return 'personal'
  return getPlan(data.plan)
}

export async function checkAgentLimit(userId: string, vaultId: string): Promise<{ allowed: boolean; planId: PlanId; current: number; limit: number | string }> {
  const { createAdminClient } = await import('./supabase-server')
  const admin = await createAdminClient()
  const planId = await getUserPlan(userId)
  const { count } = await admin.from('agents').select('id', { count: 'exact' }).eq('vault_id', vaultId).eq('is_active', true)
  const current = count || 0
  const plan = (await import('./plans')).PLANS[planId]
  const limit = plan.limits.agents
  return {
    allowed: !isAtLimit(planId, 'agents', current),
    planId,
    current,
    limit: limit === Infinity ? 'Unlimited' : limit,
  }
}

export async function checkSecretLimit(userId: string, vaultId: string): Promise<{ allowed: boolean; planId: PlanId; current: number; limit: number | string }> {
  const { createAdminClient } = await import('./supabase-server')
  const admin = await createAdminClient()
  const planId = await getUserPlan(userId)
  const { count } = await admin.from('secrets').select('id', { count: 'exact' }).eq('vault_id', vaultId)
  const current = count || 0
  const plan = (await import('./plans')).PLANS[planId]
  const limit = plan.limits.secrets
  return {
    allowed: !isAtLimit(planId, 'secrets', current),
    planId,
    current,
    limit: limit === Infinity ? 'Unlimited' : limit,
  }
}

export async function checkMCPAccess(userId: string): Promise<boolean> {
  const planId = await getUserPlan(userId)
  return canUseFeature(planId, 'mcp')
}
