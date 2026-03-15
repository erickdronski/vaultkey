import { SignJWT, jwtVerify } from 'jose'
import { randomBytes } from 'crypto'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'vaultkey-dev-secret-min-32-chars!!')

export function generateAgentKey(): string {
  const bytes = randomBytes(24).toString('base64url')
  return `vk_sk_${bytes}`
}

export async function signAgentToken(agentId: string, vaultId: string): Promise<string> {
  return await new SignJWT({ agentId, vaultId, type: 'agent' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyAgentToken(token: string): Promise<{ agentId: string; vaultId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'agent') return null
    return {
      agentId: payload.agentId as string,
      vaultId: payload.vaultId as string,
    }
  } catch {
    return null
  }
}
