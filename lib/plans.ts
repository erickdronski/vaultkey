export const PLANS = {
  personal: {
    id: 'personal',
    name: 'Personal',
    price: 9.99,
    stripePriceId: process.env.STRIPE_PRICE_PERSONAL || '',
    limits: {
      agents: 5,
      secrets: 25,
      requestsPerDay: 500,
      logRetentionDays: 30,
      webhooks: false,
      mcp: false,
      ipAllowlist: false,
    },
    features: [
      '5 agents',
      '25 secrets',
      '500 API requests/day',
      '30-day audit log',
      'REST API access',
      'Email support',
    ],
    color: '#8892aa',
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 29.99,
    stripePriceId: process.env.STRIPE_PRICE_TEAM || '',
    limits: {
      agents: 25,
      secrets: Infinity,
      requestsPerDay: Infinity,
      logRetentionDays: 365,
      webhooks: true,
      mcp: true,
      ipAllowlist: true,
    },
    features: [
      '25 agents',
      'Unlimited secrets',
      'Unlimited API requests',
      '1-year audit log',
      'REST API + MCP server',
      'Webhook alerts',
      'IP allowlisting per agent',
      'Priority support',
      'Team management (coming soon)',
    ],
    color: '#5b6aff',
  },
} as const

export type PlanId = keyof typeof PLANS
export type Plan = typeof PLANS[PlanId]

export function getPlan(planId: string | null | undefined): PlanId {
  if (planId === 'team') return 'team'
  return 'personal'
}

export function canUseFeature(planId: PlanId, feature: keyof typeof PLANS.team.limits): boolean {
  const plan = PLANS[planId]
  const val = plan.limits[feature]
  if (typeof val === 'boolean') return val
  return true
}

export function isAtLimit(planId: PlanId, feature: 'agents' | 'secrets', current: number): boolean {
  const limit = PLANS[planId].limits[feature]
  if (limit === Infinity) return false
  return current >= (limit as number)
}
