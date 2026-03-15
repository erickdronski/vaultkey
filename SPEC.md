# VaultKey MVP Spec
## "The password manager built for AI agents"

### Tagline
One vault. Every agent. Zero leaks.

### Pricing
- Personal: $9.99/month (up to 5 agents, 50 secrets)
- Team: $29/month (up to 20 agents, unlimited secrets)
- Enterprise: $99/month (unlimited agents, SSO, webhooks)

---

## TECH STACK
- Framework: Next.js 15 App Router
- Database: Supabase (Postgres + auth + RLS)
- Hosting: Vercel (free tier)
- Payments: Stripe
- Crypto: Node.js built-in `crypto` module (AES-256-GCM)
- Auth: Supabase Auth (email + OAuth)

---

## DATABASE SCHEMA (Supabase)

### users (handled by Supabase auth)

### vaults
```sql
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### secrets
```sql
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- e.g. "beehiiv_api_key"
  encrypted_value TEXT NOT NULL,   -- AES-256-GCM encrypted
  iv TEXT NOT NULL,                -- initialization vector
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- e.g. "dron-trading-bot"
  agent_key TEXT UNIQUE NOT NULL,  -- vk_sk_xxxxx (shown once)
  key_hash TEXT NOT NULL,          -- bcrypt hash for verification
  allowed_secrets TEXT[] DEFAULT '{}',  -- secret names this agent can access
  expires_at TIMESTAMPTZ,          -- null = never expires
  ip_allowlist TEXT[] DEFAULT '{}', -- empty = any IP
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

### access_logs
```sql
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  secret_name TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  error_reason TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'personal',   -- personal | team | enterprise
  status TEXT DEFAULT 'trialing', -- trialing | active | canceled
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API ROUTES

### Public Agent API (no user session needed, uses agent_key)

#### POST /api/agent/auth
Verify agent key, return session token
```json
Request: { "agent_key": "vk_sk_xxxxx" }
Response: { "token": "jwt...", "agent_id": "uuid", "expires_in": 3600 }
```

#### POST /api/agent/secret
Get a specific secret
```json
Request headers: Authorization: Bearer <token>
Request: { "secret_name": "beehiiv_api_key" }
Response: { "value": "the_actual_secret", "name": "beehiiv_api_key" }
Error 403: { "error": "not_authorized", "message": "Agent not allowed to access this secret" }
```

#### GET /api/agent/secrets
List all secret NAMES (not values) the agent can access
```json
Response: { "secrets": ["beehiiv_api_key", "kalshi_private_key", "openai_key"] }
```

### Dashboard API (requires user Supabase session)

#### POST /api/vault/secrets - Create secret
#### GET /api/vault/secrets - List secrets (names only, no values)
#### DELETE /api/vault/secrets/:id - Delete secret
#### POST /api/vault/agents - Create agent (returns key once)
#### GET /api/vault/agents - List agents
#### PATCH /api/vault/agents/:id - Update agent permissions
#### DELETE /api/vault/agents/:id - Revoke agent
#### GET /api/vault/logs - Get access logs

---

## PAGES

### / (Landing page)
- Hero: "The password manager built for AI agents"
- Problem: credentials hardcoded in prompts, scattered in env files
- Solution: one vault, agents authenticate with a key
- Code demo showing before/after
- Pricing table: $9.99 | $29 | $99
- CTA: "Start free 14-day trial"

### /dashboard
- Overview: agent count, secret count, recent access log
- Quick stats: requests today, active agents

### /dashboard/secrets
- List all secrets (names only, never show values after creation)
- Add secret button (name + value + description)
- Delete secret

### /dashboard/agents
- List agents with status (active/expired/revoked)
- Create agent: name, select allowed secrets, set expiry
- On creation: show key ONCE with copy button, warn it won't be shown again
- Edit: change allowed secrets, revoke

### /dashboard/logs
- Table: agent name | secret accessed | timestamp | IP | success/fail
- Filter by agent, date range
- Export CSV

### /dashboard/settings
- Billing (Stripe portal link)
- Account settings

---

## SECURITY DESIGN

### Secret Encryption
- Each secret encrypted with AES-256-GCM
- Encryption key derived from: PBKDF2(user_master_password + salt, 100000 iterations)
- IV stored alongside encrypted value
- We NEVER store the master password or derivation key
- Result: zero-knowledge — even if DB is compromised, secrets are unreadable

### Agent Keys
- Format: `vk_sk_` + 32 random bytes (base58 encoded)
- Stored as bcrypt hash (cost 12) in DB
- Key shown to user ONCE on creation
- Verification: bcrypt.compare(submitted_key, stored_hash)

### Rate Limiting
- Agent auth: 10 attempts per minute per IP
- Secret retrieval: 100 requests per minute per agent key
- Auto-lock agent after 10 failed auth attempts

### Audit
- Every secret retrieval logged (success + failure)
- Failed attempts with wrong key logged
- Access from new IP flagged (optional email alert)

---

## ENCRYPTION IMPLEMENTATION

```javascript
// lib/crypto.js
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

export function encryptSecret(value, masterKey) {
  const iv = randomBytes(16)
  const key = scryptSync(masterKey, 'vaultkey-salt', 32)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  
  return {
    encrypted: encrypted + ':' + authTag,
    iv: iv.toString('hex')
  }
}

export function decryptSecret(encrypted, iv, masterKey) {
  const [encryptedText, authTag] = encrypted.split(':')
  const key = scryptSync(masterKey, 'vaultkey-salt', 32)
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

Note: Master key in MVP = Supabase JWT secret + user_id hash. In v2, user sets explicit master password.

---

## ENV VARS NEEDED
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VAULT_ENCRYPTION_KEY=  # 32-byte random hex, set at deploy time
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
JWT_SECRET=  # for agent session tokens
```

---

## DESIGN SYSTEM
- Background: #0a0e1a (near black, dark navy)
- Accent: #6366f1 (indigo - trustworthy, premium)
- Success: #22c55e (green)
- Danger: #ef4444 (red)
- Font: Inter
- Style: Clean, minimal, security-focused. Think Linear meets 1Password.
- Dark mode only (security tools look better dark)

---

## AGENT USAGE EXAMPLE (for docs/landing page)

```python
# Before VaultKey (dangerous)
OPENAI_KEY = "sk-proj-hardcoded-in-code-oh-no"

# After VaultKey (secure)
import requests

def get_secret(secret_name):
    r = requests.post("https://vaultkey.app/api/agent/secret",
        headers={"Authorization": f"Bearer {AGENT_TOKEN}"},
        json={"secret_name": secret_name}
    )
    return r.json()["value"]

OPENAI_KEY = get_secret("openai_key")
```

```javascript
// OpenClaw TOOLS.md approach
// Add to openclaw config:
// vault.provider: "vaultkey"
// vault.agentKey: "vk_sk_xxxxx"
// Then OpenClaw auto-fetches secrets at runtime
```

---

## LAUNCH CHECKLIST
- [ ] Supabase project created
- [ ] Schema migrated
- [ ] Next.js app scaffolded
- [ ] Crypto module implemented + tested
- [ ] Agent auth API working
- [ ] Secret CRUD working
- [ ] Dashboard pages built
- [ ] Stripe integration (14-day trial, then $9.99/mo)
- [ ] Deployed to Vercel
- [ ] Custom domain: vaultkey.app (check availability)
- [ ] Landing page live
- [ ] ProductHunt draft ready
