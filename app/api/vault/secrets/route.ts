import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { encryptSecret, decryptSecret } from '@/lib/crypto'

async function getAuthenticatedVault() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, vault: null, admin: null }
  const admin = await createAdminClient()
  const { data: vault } = await admin.from('vaults').select('id').eq('user_id', user.id).single()
  return { user, vault, admin }
}

export async function GET() {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: secrets } = await admin!
    .from('secrets')
    .select('id, name, description, created_at, updated_at')
    .eq('vault_id', vault.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ secrets: secrets || [] })
}

export async function POST(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { name, value, description } = await req.json()
  if (!name?.trim() || !value?.trim()) return NextResponse.json({ error: 'Name and value are required' }, { status: 400 })
  const cleanName = name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  const { encrypted, iv } = encryptSecret(value)
  const { data, error } = await admin!.from('secrets').insert({
    vault_id: vault.id, name: cleanName, encrypted_value: encrypted, iv, description: description?.trim() || null,
  }).select('id, name, description, created_at').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A secret with that name already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ secret: data })
}

export async function PATCH(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id, value, description } = await req.json()
  const updates: Record<string, string> = { description, updated_at: new Date().toISOString() }
  if (value) {
    const { encrypted, iv } = encryptSecret(value)
    updates.encrypted_value = encrypted
    updates.iv = iv
  }
  const { data } = await admin!.from('secrets').update(updates).eq('id', id).eq('vault_id', vault.id).select('id, name, description, updated_at').single()
  return NextResponse.json({ secret: data })
}

export async function DELETE(req: NextRequest) {
  const { vault, admin } = await getAuthenticatedVault()
  if (!vault) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await admin!.from('secrets').delete().eq('id', id).eq('vault_id', vault.id)
  return NextResponse.json({ success: true })
}
