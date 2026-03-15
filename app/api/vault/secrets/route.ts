import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { encryptSecret } from '@/lib/crypto'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getVaultId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('sb-access-token')?.value
  if (!authToken) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(authToken)
  if (!user) return null
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  return vault?.id || null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ secrets: [] })
  const { data: secrets } = await supabaseAdmin
    .from('secrets')
    .select('id, name, description, created_at, updated_at')
    .eq('vault_id', vault.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ secrets: secrets || [] })
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ error: 'no_vault' }, { status: 400 })

  const { name, value, description } = await req.json()
  if (!name || !value) return NextResponse.json({ error: 'missing_fields' }, { status: 400 })

  const { encrypted, iv } = encryptSecret(value)
  const { data, error } = await supabaseAdmin.from('secrets').insert({
    vault_id: vault.id,
    name: name.toLowerCase().replace(/\s+/g, '_'),
    encrypted_value: encrypted,
    iv,
    description,
  }).select('id, name, description, created_at').single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'duplicate', message: 'A secret with that name already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ secret: data })
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: vault } = await supabaseAdmin.from('vaults').select('id').eq('user_id', user.id).single()
  if (!vault) return NextResponse.json({ error: 'no_vault' }, { status: 400 })
  const { id } = await req.json()
  await supabaseAdmin.from('secrets').delete().eq('id', id).eq('vault_id', vault.id)
  return NextResponse.json({ success: true })
}
