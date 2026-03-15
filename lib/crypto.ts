import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SALT = 'vaultkey-v1-salt'

function getDerivedKey(): Buffer {
  const masterKey = process.env.VAULT_ENCRYPTION_KEY
  if (!masterKey) throw new Error('VAULT_ENCRYPTION_KEY not set')
  return scryptSync(masterKey, SALT, 32)
}

export function encryptSecret(value: string): { encrypted: string; iv: string } {
  const iv = randomBytes(16)
  const key = getDerivedKey()
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString('hex'),
  }
}

export function decryptSecret(encrypted: string, iv: string): string {
  const [encryptedText, authTag] = encrypted.split(':')
  if (!encryptedText || !authTag) throw new Error('Invalid encrypted format')

  const key = getDerivedKey()
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
