-- VaultKey Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vaults
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Vault',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secrets (encrypted)
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vault_id, name)
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  allowed_secrets TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  ip_allowlist TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Access Logs
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE NOT NULL,
  secret_name TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_reason TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'personal',
  status TEXT DEFAULT 'trialing',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Vaults: users can only see their own
CREATE POLICY "Users own their vaults" ON vaults
  FOR ALL USING (auth.uid() = user_id);

-- Secrets: via vault ownership
CREATE POLICY "Users own their secrets" ON secrets
  FOR ALL USING (
    vault_id IN (SELECT id FROM vaults WHERE user_id = auth.uid())
  );

-- Agents: via vault ownership
CREATE POLICY "Users own their agents" ON agents
  FOR ALL USING (
    vault_id IN (SELECT id FROM vaults WHERE user_id = auth.uid())
  );

-- Logs: via vault ownership
CREATE POLICY "Users own their logs" ON access_logs
  FOR ALL USING (
    vault_id IN (SELECT id FROM vaults WHERE user_id = auth.uid())
  );

-- Subscriptions
CREATE POLICY "Users own their subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create vault on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vaults (user_id, name)
  VALUES (NEW.id, 'My Vault');
  
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'personal', 'trialing');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
