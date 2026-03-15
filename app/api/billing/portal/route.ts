import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: sub } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: 'no_customer' }, { status: 400 })

  const stripe = getStripe()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultkey-zeta.vercel.app'

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard/billing`,
  })

  return NextResponse.json({ url: session.url })
}
