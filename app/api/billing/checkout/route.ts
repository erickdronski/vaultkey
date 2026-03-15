import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getStripe, createOrRetrieveCustomer } from '@/lib/stripe'
import { PLANS, type PlanId } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: PlanId }
  if (!PLANS[plan]) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })

  const customerId = await createOrRetrieveCustomer(user.id, user.email!)
  const stripe = getStripe()
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'https://vaultkey-zeta.vercel.app'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[plan].stripePriceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 14,
      metadata: { supabase_user_id: user.id, plan },
    },
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/dashboard/billing`,
    metadata: { supabase_user_id: user.id, plan },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  return NextResponse.json({ url: session.url })
}
