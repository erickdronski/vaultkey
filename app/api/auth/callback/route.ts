import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Check if first-time user — redirect to onboarding
      const admin = await (await import('@/lib/supabase-server')).createAdminClient()
      const { data: vault } = await admin.from('vaults').select('id').eq('user_id', data.user.id).single()
      const { count } = await admin.from('secrets').select('id', { count: 'exact' }).eq('vault_id', vault?.id || '').limit(1)
      const isNewUser = !count || count === 0
      return NextResponse.redirect(`${origin}${isNewUser ? '/onboarding' : next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
