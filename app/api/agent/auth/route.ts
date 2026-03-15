import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { signAgentToken } from '@/lib/agent-auth'

export async function POST(req: NextRequest) {
  try {
    const { agent_key } = await req.json()
    if (!agent_key || !agent_key.startsWith('vk_sk_')) {
      return NextResponse.json({ error: 'invalid_key', message: 'Invalid agent key format' }, { status: 401 })
    }

    // Find agents and check key
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select('id, vault_id, key_hash, is_active, expires_at')
      .eq('is_active', true)

    if (error || !agents?.length) {
      return NextResponse.json({ error: 'not_found', message: 'Agent not found' }, { status: 401 })
    }

    let matchedAgent = null
    for (const agent of agents) {
      const match = await bcrypt.compare(agent_key, agent.key_hash)
      if (match) { matchedAgent = agent; break }
    }

    if (!matchedAgent) {
      return NextResponse.json({ error: 'invalid_key', message: 'Invalid agent key' }, { status: 401 })
    }

    if (matchedAgent.expires_at && new Date(matchedAgent.expires_at) < new Date()) {
      return NextResponse.json({ error: 'key_expired', message: 'Agent key has expired' }, { status: 401 })
    }

    // Update last used
    await supabaseAdmin.from('agents').update({ last_used_at: new Date().toISOString() }).eq('id', matchedAgent.id)

    const token = await signAgentToken(matchedAgent.id, matchedAgent.vault_id)
    return NextResponse.json({ token, agent_id: matchedAgent.id, expires_in: 3600 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
