import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { generateAgentKey } from '@/lib/agent-auth'

async function getAuthenticatedVault() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, vault: null, admin: null }
  const admin = await createAdminClient()
  const { data: vault } = await admin.from('vaults').select('id').eq('user_id', user.id).single()
  return { user, vault, admin }
}

export async function GET() {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: agents } = await admin!
    .from('agents')
    .select('id, name, allowed_secrets, expires_at, is_active, created_at, last_used_at')
    .eq('vault_id', vault.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ agents: agents || [] })
}

export async function POST(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { name, allowed_secrets, expires_at } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
  const agentKey = generateAgentKey()
  const keyHash = await bcrypt.hash(agentKey, 12)
  const { data, error } = await admin!.from('agents').insert({
    vault_id: vault.id, name: name.trim(), key_hash: keyHash,
    allowed_secrets: allowed_secrets || [], expires_at: expires_at || null, is_active: true,
  }).select('id, name, allowed_secrets, expires_at, created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agent: data, agent_key: agentKey })
}

export async function PATCH(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id, allowed_secrets, is_active, expires_at, name } = await req.json()
  const updates: Record<string, unknown> = {}
  if (allowed_secrets !== undefined) updates.allowed_secrets = allowed_secrets
  if (is_active !== undefined) updates.is_active = is_active
  if (expires_at !== undefined) updates.expires_at = expires_at
  if (name !== undefined) updates.name = name.trim()
  const { data } = await admin!.from('agents').update(updates).eq('id', id).eq('vault_id', vault.id).select().single()
  return NextResponse.json({ agent: data })
}

export async function DELETE(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await admin!.from('agents').delete().eq('id', id).eq('vault_id', vault.id)
  return NextResponse.json({ success: true })
}
