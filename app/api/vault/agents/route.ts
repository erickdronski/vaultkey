import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { generateAgentKey } from '@/lib/agent-auth'

async function getUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ agents: [] })
  const { data: agents } = await supabaseAdmin
    .from('agents')
    .select('id, name, allowed_secrets, expires_at, is_active, created_at, last_used_at')
    .eq('vault_id', vault.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ agents: agents || [] })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ error: 'no_vault' }, { status: 400 })

  const { name, allowed_secrets, expires_at } = await req.json()
  if (!name) return NextResponse.json({ error: 'missing_name' }, { status: 400 })

  const agentKey = generateAgentKey()
  const keyHash = await bcrypt.hash(agentKey, 12)

  const { data, error } = await supabaseAdmin.from('agents').insert({
    vault_id: vault.id,
    name,
    key_hash: keyHash,
    allowed_secrets: allowed_secrets || [],
    expires_at: expires_at || null,
    is_active: true,
  }).select('id, name, allowed_secrets, expires_at, created_at').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the key ONCE — never stored in plaintext
  return NextResponse.json({ agent: data, agent_key: agentKey, warning: 'Copy this key now. It will never be shown again.' })
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  const { id, allowed_secrets, is_active, expires_at } = await req.json()
  const { data } = await supabaseAdmin.from('agents')
    .update({ allowed_secrets, is_active, expires_at })
    .eq('id', id).eq('vault_id', vault?.id)
    .select().single()
  return NextResponse.json({ agent: data })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  const { id } = await req.json()
  await supabaseAdmin.from('agents').update({ is_active: false }).eq('id', id).eq('vault_id', vault?.id)
  return NextResponse.json({ success: true })
}
