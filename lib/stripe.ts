import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      // @ts-ignore — stripe version mismatch with installed types
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export async function createOrRetrieveCustomer(userId: string, email: string): Promise<string> {
  const stripe = getStripe()
  const { createAdminClient } = await import('./supabase-server')
  const admin = await createAdminClient()

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (sub?.stripe_customer_id) return sub.stripe_customer_id

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  })

  await admin
    .from('subscriptions')
    .upsert({ user_id: userId, stripe_customer_id: customer.id }, { onConflict: 'user_id' })

  return customer.id
}
