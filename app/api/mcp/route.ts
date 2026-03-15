/**
 * VaultKey MCP Server
 * 
 * Implements the Model Context Protocol (MCP) over HTTP/SSE.
 * Agents can use this to retrieve secrets without custom auth code.
 * 
 * Auth: Bearer token (agent key) in Authorization header
 * 
 * Tools exposed:
 *   - get_secret: retrieve a secret by name
 *   - list_secrets: list secret names the agent can access
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase-server'
import { decryptSecret } from '@/lib/crypto'

const MCP_VERSION = '2024-11-05'

const TOOLS = [
  {
    name: 'get_secret',
    description: 'Retrieve a secret value from VaultKey. The agent must have permission for the requested secret.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The secret name (e.g. "openai_key", "kalshi_api_key")' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_secrets',
    description: 'List the names of secrets this agent is authorized to access.',
    inputSchema: { type: 'object', properties: {} },
  },
]

async function authenticateAgent(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const key = auth.slice(7)
  if (!key.startsWith('vk_sk_')) return null

  const admin = await createAdminClient()
  const { data: agents } = await admin.from('agents').select('id, vault_id, key_hash, is_active, expires_at, allowed_secrets').eq('is_active', true)
  if (!agents?.length) return null

  for (const agent of agents) {
    const match = await bcrypt.compare(key, agent.key_hash)
    if (match) {
      if (agent.expires_at && new Date(agent.expires_at) < new Date()) return null
      await admin.from('agents').update({ last_used_at: new Date().toISOString() }).eq('id', agent.id)
      return agent
    }
  }
  return null
}

async function handleToolCall(admin: Awaited<ReturnType<typeof createAdminClient>>, agent: { id: string; vault_id: string; allowed_secrets: string[] }, toolName: string, input: Record<string, string>, ip: string) {
  if (toolName === 'list_secrets') {
    if (agent.allowed_secrets.includes('*')) {
      const { data } = await admin.from('secrets').select('name, description').eq('vault_id', agent.vault_id)
      return { content: [{ type: 'text', text: JSON.stringify((data || []).map(s => ({ name: s.name, description: s.description })), null, 2) }] }
    }
    return { content: [{ type: 'text', text: JSON.stringify(agent.allowed_secrets) }] }
  }

  if (toolName === 'get_secret') {
    const { name } = input
    if (!agent.allowed_secrets.includes(name) && !agent.allowed_secrets.includes('*')) {
      await admin.from('access_logs').insert({ agent_id: agent.id, vault_id: agent.vault_id, secret_name: name, ip_address: ip, success: false, error_reason: 'not_authorized' })
      return { content: [{ type: 'text', text: `Error: Agent is not authorized to access secret "${name}"` }], isError: true }
    }
    const { data: secret } = await admin.from('secrets').select('encrypted_value, iv, name').eq('vault_id', agent.vault_id).eq('name', name).single()
    if (!secret) {
      await admin.from('access_logs').insert({ agent_id: agent.id, vault_id: agent.vault_id, secret_name: name, ip_address: ip, success: false, error_reason: 'not_found' })
      return { content: [{ type: 'text', text: `Error: Secret "${name}" not found` }], isError: true }
    }
    const value = decryptSecret(secret.encrypted_value, secret.iv)
    await admin.from('access_logs').insert({ agent_id: agent.id, vault_id: agent.vault_id, secret_name: name, ip_address: ip, success: true })
    return { content: [{ type: 'text', text: value }] }
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true }
}

export async function POST(req: NextRequest) {
  const agent = await authenticateAgent(req)
  if (!agent) return NextResponse.json({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null }, { status: 401 })

  const body = await req.json()
  const { jsonrpc, method, params, id } = body
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const admin = await createAdminClient()

  const respond = (result: unknown) => NextResponse.json({ jsonrpc: '2.0', result, id })
  const error = (code: number, message: string) => NextResponse.json({ jsonrpc: '2.0', error: { code, message }, id }, { status: 400 })

  switch (method) {
    case 'initialize':
      return respond({ protocolVersion: MCP_VERSION, capabilities: { tools: {} }, serverInfo: { name: 'VaultKey MCP Server', version: '1.0.0' } })

    case 'tools/list':
      return respond({ tools: TOOLS })

    case 'tools/call': {
      const { name: toolName, arguments: toolInput = {} } = params || {}
      const result = await handleToolCall(admin, agent, toolName, toolInput, ip)
      return respond(result)
    }

    case 'ping':
      return respond({})

    default:
      return error(-32601, `Method not found: ${method}`)
  }
}

export async function GET(req: NextRequest) {
  // Return MCP server manifest
  return NextResponse.json({
    name: 'VaultKey',
    description: 'Secure secrets vault for AI agents',
    version: '1.0.0',
    mcp_version: MCP_VERSION,
    endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/mcp`,
    auth: { type: 'bearer', format: 'vk_sk_*' },
    tools: TOOLS,
  })
}
