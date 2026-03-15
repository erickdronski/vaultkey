import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAgentToken } from '@/lib/agent-auth'
import { decryptSecret } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const payload = await verifyAgentToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }

  const { secret_name } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  // Get agent permissions
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('allowed_secrets, is_active')
    .eq('id', payload.agentId)
    .single()

  if (!agent?.is_active) {
    return NextResponse.json({ error: 'agent_revoked' }, { status: 403 })
  }

  // Check permission
  if (!agent.allowed_secrets.includes(secret_name) && !agent.allowed_secrets.includes('*')) {
    await supabaseAdmin.from('access_logs').insert({
      agent_id: payload.agentId,
      vault_id: payload.vaultId,
      secret_name,
      ip_address: ip,
      success: false,
      error_reason: 'not_authorized',
    })
    return NextResponse.json({ error: 'not_authorized', message: `Agent not authorized to access '${secret_name}'` }, { status: 403 })
  }

  // Get secret
  const { data: secret } = await supabaseAdmin
    .from('secrets')
    .select('encrypted_value, iv, name')
    .eq('vault_id', payload.vaultId)
    .eq('name', secret_name)
    .single()

  if (!secret) {
    await supabaseAdmin.from('access_logs').insert({
      agent_id: payload.agentId,
      vault_id: payload.vaultId,
      secret_name,
      ip_address: ip,
      success: false,
      error_reason: 'not_found',
    })
    return NextResponse.json({ error: 'not_found', message: `Secret '${secret_name}' not found` }, { status: 404 })
  }

  // Decrypt and return
  const value = decryptSecret(secret.encrypted_value, secret.iv)

  await supabaseAdmin.from('access_logs').insert({
    agent_id: payload.agentId,
    vault_id: payload.vaultId,
    secret_name,
    ip_address: ip,
    success: true,
  })

  return NextResponse.json({ name: secret.name, value })
}
