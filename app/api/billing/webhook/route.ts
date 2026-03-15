import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    return NextResponse.json({ error: `Webhook error: ${(err as Error).message}` }, { status: 400 })
  }

  const admin = await createAdminClient()

  async function upsertSub(sub: Stripe.Subscription) {
    const userId = sub.metadata?.supabase_user_id || (sub.customer as string)
    const plan = sub.metadata?.plan || 'personal'
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

    // Try to find user by customer ID if metadata is missing
    let resolvedUserId = userId
    if (!sub.metadata?.supabase_user_id) {
      const { data } = await admin.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).single()
      if (data) resolvedUserId = data.user_id
    }

    if (!resolvedUserId) return

    const periodEnd = (sub as Stripe.Subscription & { current_period_end: number }).current_period_end
    await admin.from('subscriptions').upsert({
      user_id: resolvedUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    }, { onConflict: 'user_id' })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await upsertSub(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      await admin.from('subscriptions')
        .update({ status: 'canceled', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (customerId) {
        await admin.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
